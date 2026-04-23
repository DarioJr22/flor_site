// ============================================================
// useTickets — CRUD de tickets de alimentação
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type {
  TicketAlimentacaoRow,
  TicketAlimentacaoInsert,
  TicketAlimentacaoUpdate,
} from '../lib/database.types';

export interface FiltrosTickets {
  empresaId?: string;
  dataInicio?: string;
  dataFim?: string;
  status?: string;
}

export function useTickets(filtrosIniciais?: FiltrosTickets) {
  const [tickets, setTickets] = useState<TicketAlimentacaoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (filtros?: FiltrosTickets) => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('tickets_alimentacao')
      .select('*')
      .order('data_refeicao', { ascending: false })
      .order('created_at', { ascending: false });

    if (filtros?.empresaId) {
      query = query.eq('empresa_id', filtros.empresaId);
    }
    if (filtros?.dataInicio) {
      query = query.gte('data_refeicao', filtros.dataInicio);
    }
    if (filtros?.dataFim) {
      query = query.lte('data_refeicao', filtros.dataFim);
    }
    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setTickets(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll(filtrosIniciais);
  }, [fetchAll, filtrosIniciais]);

  /**
   * Insere um único ticket.
   */
  const create = useCallback(async (ticket: TicketAlimentacaoInsert) => {
    setError(null);
    const { data, error: err } = await supabase
      .from('tickets_alimentacao')
      .insert(ticket as any)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    const row = data as TicketAlimentacaoRow;
    setTickets(prev => [row, ...prev]);
    return row;
  }, []);

  /**
   * Insere múltiplos tickets de um lote de importação.
   * Retorna os tickets criados ou null em caso de erro.
   */
  const createBatch = useCallback(async (ticketsBatch: TicketAlimentacaoInsert[]) => {
    setError(null);
    if (ticketsBatch.length === 0) return [];

    const { data, error: err } = await supabase
      .from('tickets_alimentacao')
      .insert(ticketsBatch as any)
      .select();
    if (err) {
      setError(err.message);
      return null;
    }
    const rows = (data ?? []) as TicketAlimentacaoRow[];
    setTickets(prev => [...rows, ...prev]);
    return rows;
  }, []);

  /**
   * Atualiza um ticket existente.
   */
  const update = useCallback(async (id: string, updates: TicketAlimentacaoUpdate) => {
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table: any = supabase.from('tickets_alimentacao');
    const { data, error: err } = await table
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    const row = data as TicketAlimentacaoRow;
    setTickets(prev => prev.map(t => (t.id === id ? row : t)));
    return row;
  }, []);

  /**
   * Marca tickets como impressos (em lote).
   */
  const marcarImpressos = useCallback(async (ids: string[]) => {
    setError(null);
    const agora = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table: any = supabase.from('tickets_alimentacao');
    const { error: err } = await table
      .update({ status: 'impresso', impresso_em: agora })
      .in('id', ids);
    if (err) {
      setError(err.message);
      return false;
    }
    setTickets(prev =>
      prev.map(t => (ids.includes(t.id) ? { ...t, status: 'impresso' as const, impresso_em: agora } : t))
    );
    return true;
  }, []);

  /**
   * Remove um ticket.
   */
  const remove = useCallback(async (id: string) => {
    setError(null);
    const { error: err } = await supabase
      .from('tickets_alimentacao')
      .delete()
      .eq('id', id);
    if (err) {
      setError(err.message);
      return false;
    }
    setTickets(prev => prev.filter(t => t.id !== id));
    return true;
  }, []);

  /**
   * Verifica tickets duplicados (mesmo funcionário + empresa + data).
   */
  const verificarDuplicados = useCallback(async (
    nomes: string[],
    empresaId: string,
    dataRefeicao: string
  ): Promise<string[]> => {
    const { data } = await supabase
      .from('tickets_alimentacao')
      .select('nome_funcionario')
      .eq('empresa_id', empresaId)
      .eq('data_refeicao', dataRefeicao)
      .in('nome_funcionario', nomes);

    return (data ?? []).map((d: any) => d.nome_funcionario as string);
  }, []);

  return {
    tickets,
    loading,
    error,
    fetchAll,
    create,
    createBatch,
    update,
    remove,
    marcarImpressos,
    verificarDuplicados,
  };
}
