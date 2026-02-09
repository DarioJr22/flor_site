// ============================================================
// useLeadCapture — Hook para submissão de leads (Supabase)
// Com retry, offline fallback e tracking GA4
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { LeadInsert } from '../lib/database.types';
import {
  type LeadFormData,
  sanitize,
  birthdayToISO,
} from '../lib/leadValidation';
import {
  trackFormSubmit,
  trackGenerateLead,
  trackFormError,
  trackHighIntentLead,
  getAttribution,
  type Attribution,
} from '../lib/analytics';

// --------------- Constantes ---------------

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_MS = 60_000; // 1 minuto entre submissões
const OFFLINE_KEY = 'flor_offline_leads';

// --------------- Tipos ---------------

export interface SubmitResult {
  success: boolean;
  message: string;
  data?: any;
}

interface LeadScoreContext {
  timeOnPage: number;
  scrollDepth: number;
  ctaClicks: number;
  sectionViews: number;
}

// --------------- Hook ---------------

export function useLeadCapture() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const retryCountRef = useRef(0);

  // Tenta reenviar leads que ficaram offline ao montar o hook
  useEffect(() => {
    retryOfflineLeads();
  }, []);

  /** Verifica rate-limit */
  const checkRateLimit = useCallback((): boolean => {
    try {
      const lastSubmit = localStorage.getItem('flor_last_lead_submit');
      if (lastSubmit) {
        const elapsed = Date.now() - parseInt(lastSubmit, 10);
        if (elapsed < RATE_LIMIT_MS) return false;
      }
    } catch {
      // localStorage não disponível
    }
    return true;
  }, []);

  /** Verifica se email já existe no banco */
  const checkDuplicateEmail = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .limit(1);

      if (error) {
        console.warn('[LeadCapture] Erro ao verificar email duplicado:', error.message);
        return false; // na dúvida, permite continuar
      }
      return (data?.length ?? 0) > 0;
    } catch {
      return false;
    }
  }, []);

  /** Monta o payload para o Supabase */
  const buildPayload = useCallback((formData: LeadFormData): LeadInsert => {
    return {
      name: sanitize(formData.name),
      email: sanitize(formData.email).toLowerCase(),
      phone: formData.phone.replace(/\D/g, ''),
      birthday: birthdayToISO(formData.birthday),
      preferences: formData.preferences.length > 0
        ? formData.preferences.join(', ')
        : null,
      promo_code: null,
    };
  }, []);

  /** Insere o lead no Supabase com retry */
  const insertWithRetry = useCallback(async (
    payload: LeadInsert,
    attempt = 1,
  ): Promise<SubmitResult> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert(payload as any)
        .select()
        .single();

      if (error) {
        // Duplicate unique constraint
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          return {
            success: false,
            message: 'Este email já está cadastrado.',
          };
        }
        throw error;
      }

      return {
        success: true,
        message: 'Cadastro realizado com sucesso! Em breve entraremos em contato.',
        data,
      };
    } catch (err: any) {
      if (attempt < MAX_RETRIES) {
        console.warn(`[LeadCapture] Tentativa ${attempt} falhou, retentando...`, err.message);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
        return insertWithRetry(payload, attempt + 1);
      }
      throw err;
    }
  }, []);

  /** Salva lead offline para reenvio posterior */
  const saveOffline = useCallback((payload: LeadInsert) => {
    try {
      const existing = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]') as LeadInsert[];
      existing.push(payload);
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(existing));
      console.log('[LeadCapture] Lead salvo offline para reenvio posterior');
    } catch {
      console.error('[LeadCapture] Não foi possível salvar lead offline');
    }
  }, []);

  /** Tenta reenviar leads salvos offline */
  const retryOfflineLeads = useCallback(async () => {
    try {
      const raw = localStorage.getItem(OFFLINE_KEY);
      if (!raw) return;
      const pending = JSON.parse(raw) as LeadInsert[];
      if (pending.length === 0) return;

      console.log(`[LeadCapture] Tentando reenviar ${pending.length} lead(s) offline...`);
      const failed: LeadInsert[] = [];

      for (const lead of pending) {
        try {
          const { error } = await supabase.from('leads').insert(lead as any);
          if (error && error.code !== '23505') {
            failed.push(lead);
          }
        } catch {
          failed.push(lead);
        }
      }

      if (failed.length > 0) {
        localStorage.setItem(OFFLINE_KEY, JSON.stringify(failed));
      } else {
        localStorage.removeItem(OFFLINE_KEY);
        console.log('[LeadCapture] Todos os leads offline reenviados com sucesso!');
      }
    } catch {
      // ignore
    }
  }, []);

  /** Submissão principal */
  const submitLead = useCallback(async (
    formData: LeadFormData,
    scoreCtx?: LeadScoreContext,
  ): Promise<SubmitResult> => {
    setIsSubmitting(true);
    setResult(null);
    retryCountRef.current = 0;

    // Honeypot check
    if (formData.website) {
      console.warn('[LeadCapture] Honeypot ativado — spam bloqueado');
      // Fingir sucesso para não alertar o bot
      const fakeResult: SubmitResult = {
        success: true,
        message: 'Cadastro realizado com sucesso!',
      };
      setResult(fakeResult);
      setIsSubmitting(false);
      return fakeResult;
    }

    // Rate limit
    if (!checkRateLimit()) {
      const rl: SubmitResult = {
        success: false,
        message: 'Aguarde um momento antes de enviar novamente.',
      };
      setResult(rl);
      setIsSubmitting(false);
      trackFormError('rate_limit', rl.message);
      return rl;
    }

    const fieldsCount = [
      formData.name, formData.email, formData.phone,
      formData.birthday, formData.preferences.length > 0 ? 'yes' : '',
    ].filter(Boolean).length;

    trackFormSubmit(fieldsCount);

    // Verificar email duplicado
    const isDup = await checkDuplicateEmail(formData.email);
    if (isDup) {
      const dupResult: SubmitResult = {
        success: false,
        message: 'Este email já está cadastrado.',
      };
      setResult(dupResult);
      setIsSubmitting(false);
      trackFormError('email_duplicate', dupResult.message);
      return dupResult;
    }

    const payload = buildPayload(formData);

    try {
      const res = await insertWithRetry(payload);
      setResult(res);

      if (res.success) {
        // Registrar no rate-limiter
        try {
          localStorage.setItem('flor_last_lead_submit', Date.now().toString());
        } catch { /* ignore */ }

        trackGenerateLead();

        // Lead quality scoring
        if (scoreCtx) {
          trackHighIntentLead({
            ...scoreCtx,
            completedOptionalFields: [
              formData.birthday, formData.preferences.length > 0 ? 'yes' : '',
            ].filter(Boolean).length,
          });
        }
      } else {
        trackFormError('api_error', res.message);
      }

      setIsSubmitting(false);
      return res;
    } catch (err: any) {
      console.error('[LeadCapture] Falha após retries:', err);

      // Offline fallback
      if (!navigator.onLine) {
        saveOffline(payload);
        const offlineResult: SubmitResult = {
          success: true,
          message: 'Você está offline. Seu cadastro será enviado assim que a conexão for restabelecida.',
        };
        setResult(offlineResult);
        setIsSubmitting(false);
        return offlineResult;
      }

      const errResult: SubmitResult = {
        success: false,
        message: 'Erro ao realizar cadastro. Tente novamente em alguns instantes.',
      };
      setResult(errResult);
      setIsSubmitting(false);
      trackFormError('network_error', err.message || 'Unknown error');
      return errResult;
    }
  }, [checkRateLimit, checkDuplicateEmail, buildPayload, insertWithRetry, saveOffline]);

  const resetResult = useCallback(() => setResult(null), []);

  return {
    submitLead,
    isSubmitting,
    result,
    resetResult,
    retryOfflineLeads,
  };
}
