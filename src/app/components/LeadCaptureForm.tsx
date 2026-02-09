// ============================================================
// LeadCaptureForm — Formulário completo de captura de leads
// Mobile-first, com validação, tracking GA4, anti-spam, LGPD
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import {
  Gift,
  Sparkles,
  Check,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Loader2,
  AlertCircle,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  type LeadFormData,
  type ValidationErrors,
  PREFERENCES_OPTIONS,
  validateLeadForm,
  hasErrors,
  formatPhoneInput,
  formatBirthdayInput,
  countFilledFields,
  progressPercentage,
  validateName,
  validateEmail,
  validatePhone,
} from '@/lib/leadValidation';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import {
  trackFormView,
  trackFormStart,
  trackFormProgress,
  trackPreferencesSelected,
  trackCtaClick,
} from '@/lib/analytics';

// --------------- Estado inicial ---------------

const INITIAL_FORM: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  birthday: '',
  preferences: [],
  terms: false,
  website: '', // honeypot
};

const FORM_STORAGE_KEY = 'flor_lead_form_draft';

// --------------- Componente ---------------

export function LeadCaptureForm() {
  // Intersection observer — rastreia quando o form entra no viewport
  const [sectionRef, sectionInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formRef, formInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  // Estados
  const [formData, setFormData] = useState<LeadFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Tracking flags
  const formStartedRef = useRef(false);
  const lastProgressRef = useRef(0);
  const formViewedRef = useRef(false);

  // Hook de submissão
  const { submitLead, isSubmitting, result, resetResult } = useLeadCapture();

  // --- Auto-scroll via hash ou query param (?cadastro=true / #cadastro) ---
  useEffect(() => {
    const shouldScroll =
      window.location.hash === '#cadastro' ||
      new URLSearchParams(window.location.search).get('cadastro') === 'true';

    if (shouldScroll) {
      // Aguarda o DOM renderizar para scrollar
      setTimeout(() => {
        const el = document.getElementById('cliente-especial');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }

    const handleHash = () => {
      if (window.location.hash === '#cadastro') {
        const el = document.getElementById('cliente-especial');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // --- Restaurar rascunho do localStorage ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<LeadFormData>;
        setFormData((prev) => ({ ...prev, ...parsed, terms: false, website: '' }));
      }
    } catch { /* ignore */ }
  }, []);

  // --- Salvar rascunho no localStorage ---
  useEffect(() => {
    try {
      // Não salvar honeypot nem terms
      const { website, terms, ...draft } = formData;
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draft));
    } catch { /* ignore */ }
  }, [formData]);

  // --- Rastrear visualização do formulário ---
  useEffect(() => {
    if (formInView && !formViewedRef.current) {
      formViewedRef.current = true;
      trackFormView();
    }
  }, [formInView]);

  // --- Rastrear progresso ---
  useEffect(() => {
    const pct = progressPercentage(formData);
    // Emite nos marcos 33%, 66%, 100%
    const thresholds = [33, 66, 100];
    for (const t of thresholds) {
      if (pct >= t && lastProgressRef.current < t) {
        const lastField = getLastField(formData);
        trackFormProgress(t, lastField);
        lastProgressRef.current = t;
      }
    }
  }, [formData]);

  // --------------- Handlers ---------------

  const handleFieldFocus = useCallback((fieldName: string) => {
    if (!formStartedRef.current) {
      formStartedRef.current = true;
      trackFormStart(fieldName);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev };

      switch (name) {
        case 'phone':
          updated.phone = formatPhoneInput(value);
          break;
        case 'birthday':
          updated.birthday = formatBirthdayInput(value);
          break;
        default:
          (updated as any)[name] = value;
      }

      return updated;
    });

    // Limpar erro desse campo
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof ValidationErrors];
        return next;
      });
    }
  }, [errors]);

  const handlePreferenceToggle = useCallback((pref: string) => {
    setFormData((prev) => {
      const current = prev.preferences;
      const next = current.includes(pref)
        ? current.filter((p) => p !== pref)
        : [...current, pref];

      // Rastrear seleção
      trackPreferencesSelected(next);
      return { ...prev, preferences: next };
    });
  }, []);

  const handleTermsChange = useCallback((checked: boolean | 'indeterminate') => {
    const val = checked === true;
    setFormData((prev) => ({ ...prev, terms: val }));
    if (val && errors.terms) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.terms;
        return next;
      });
    }
  }, [errors]);

  /** Validação em tempo real ao blur */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let err: string | undefined;

    switch (name) {
      case 'name':
        err = validateName(value);
        break;
      case 'email':
        err = validateEmail(value);
        break;
      case 'phone':
        err = validatePhone(value);
        break;
    }

    if (err) {
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar tudo
    const validationErrors = validateLeadForm(formData);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    const res = await submitLead(formData);

    if (res.success) {
      setShowSuccess(true);
      // Limpar rascunho
      try { localStorage.removeItem(FORM_STORAGE_KEY); } catch { /* ignore */ }
    }
  }, [formData, submitLead]);

  const handleReset = useCallback(() => {
    setShowSuccess(false);
    setFormData(INITIAL_FORM);
    resetResult();
    formStartedRef.current = false;
    lastProgressRef.current = 0;
  }, [resetResult]);

  const handleCtaClick = useCallback(() => {
    trackCtaClick('Quero me cadastrar', 'lead_section', 'button');
    const el = document.getElementById('lead-capture-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // --------------- Rendering ---------------

  return (
    <section
      id="cliente-especial"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-[#FFC107] to-[#D4A017] py-16 md:py-24"
    >
      {/* Animated Background */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -left-20 top-0 h-40 w-40 rounded-full bg-white/10"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-white/10"
      />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl text-center text-white"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6 inline-block"
          >
            <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm">
              <Gift className="h-16 w-16" />
            </div>
          </motion.div>

          <h2 className="mb-4 text-4xl md:text-5xl">
            Seja um Cliente Especial
          </h2>

          <p className="mb-8 text-lg md:text-xl opacity-90">
            Cadastre-se e ganhe <strong>10% de desconto</strong> no seu primeiro
            pedido, promoções exclusivas e um brinde no mês do seu aniversário! 🎉
          </p>

          {/* Benefits */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: '🎁', text: '10% OFF no 1º Pedido' },
              { icon: '🎂', text: 'Brinde de Aniversário' },
              { icon: '⭐', text: 'Promoções Exclusivas' },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 20 }}
                animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="rounded-lg bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="mb-2 text-3xl">{benefit.icon}</div>
                <p className="text-sm font-medium">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          ref={formRef}
          id="lead-capture-form"
          initial={{ opacity: 0, y: 40 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 md:p-8"
        >
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Form Title */}
                <div className="mb-6 text-center">
                  <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFC107]/20">
                    <Gift className="h-7 w-7 text-[#D4A017]" />
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                    Cadastro Especial
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Preencha seus dados e ganhe seu desconto
                  </p>
                </div>

                {/* Error Banner */}
                {result && !result.success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {result.message}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Honeypot — campo invisível */}
                  <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, website: e.target.value }))
                      }
                    />
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>Progresso</span>
                      <span>{progressPercentage(formData)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#FFC107] to-[#D4A017]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage(formData)}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <Label htmlFor="lc-name" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <User className="h-3.5 w-3.5" />
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lc-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus('name')}
                      onBlur={handleBlur}
                      className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="lc-email" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Mail className="h-3.5 w-3.5" />
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lc-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus('email')}
                      onBlur={handleBlur}
                      className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Telefone / WhatsApp */}
                  <div>
                    <Label htmlFor="lc-phone" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Phone className="h-3.5 w-3.5" />
                      WhatsApp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lc-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(81) 99999-9999"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus('phone')}
                      onBlur={handleBlur}
                      className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <Label htmlFor="lc-birthday" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Calendar className="h-3.5 w-3.5" />
                      Data de Nascimento
                      <span className="ml-1 text-xs text-gray-400">(opcional)</span>
                    </Label>
                    <Input
                      id="lc-birthday"
                      name="birthday"
                      type="text"
                      autoComplete="bday"
                      placeholder="DD/MM/AAAA"
                      value={formData.birthday}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus('birthday')}
                      className={errors.birthday ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {errors.birthday ? (
                      <p className="mt-1 text-xs text-red-500">{errors.birthday}</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Ganhe um brinde especial no seu aniversário 🎂
                      </p>
                    )}
                  </div>

                  {/* Preferências */}
                  <div>
                    <Label className="mb-2 flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Heart className="h-3.5 w-3.5" />
                      O que te interessa?
                      <span className="ml-1 text-xs text-gray-400">(opcional)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {PREFERENCES_OPTIONS.map((pref) => {
                        const isSelected = formData.preferences.includes(pref);
                        return (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => handlePreferenceToggle(pref)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              isSelected
                                ? 'border-[#D4A017] bg-[#FFC107]/20 text-[#9A7B0A] dark:bg-[#FFC107]/10 dark:text-[#FFC107]'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#FFC107] hover:bg-[#FFC107]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {isSelected && <Check className="mr-1 inline h-3 w-3" />}
                            {pref}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LGPD - Termos */}
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="lc-terms"
                      checked={formData.terms}
                      onCheckedChange={handleTermsChange}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="lc-terms"
                      className="text-xs leading-relaxed text-gray-600 dark:text-gray-400"
                    >
                      Aceito os{' '}
                      <a href="/termos" className="underline hover:text-[#D4A017]" target="_blank" rel="noopener">
                        termos de uso
                      </a>{' '}
                      e a{' '}
                      <a href="/privacidade" className="underline hover:text-[#D4A017]" target="_blank" rel="noopener">
                        política de privacidade
                      </a>
                      . Seus dados serão usados exclusivamente para envio de promoções e novidades.
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="-mt-2 text-xs text-red-500">{errors.terms}</p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#FFC107] text-black hover:bg-[#D4A017] disabled:opacity-60"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Cadastrar e Ganhar Desconto
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              /* ============ SUCESSO ============ */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500"
                >
                  <PartyPopper className="h-10 w-10 text-white" />
                </motion.div>

                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Cadastro Realizado! 🎉
                </h3>

                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Obrigado por se cadastrar! Em breve você receberá nossas promoções e novidades exclusivas.
                </p>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="text-gray-600"
                >
                  Fechar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// --------------- Utilitários internos ---------------

function getLastField(data: LeadFormData): string {
  if (data.preferences.length > 0) return 'preferences';
  if (data.birthday) return 'birthday';
  if (data.phone.replace(/\D/g, '').length >= 10) return 'phone';
  if (data.email) return 'email';
  if (data.name) return 'name';
  return '';
}
