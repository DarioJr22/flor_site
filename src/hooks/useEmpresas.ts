// ============================================================
// useEmpresas — CRUD de empresas clientes (tickets empresariais)
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type {
  EmpresaClienteRow,
  EmpresaClienteInsert,
  EmpresaClienteUpdate,
} from '../lib/database.types';

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<EmpresaClienteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('empresas_clientes')
      .select('*')
      .order('nome');
    if (err) setError(err.message);
    else setEmpresas(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (empresa: EmpresaClienteInsert) => {
    setError(null);
    const { data, error: err } = await supabase
      .from('empresas_clientes')
      .insert(empresa as any)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    setEmpresas(prev => [...prev, data as EmpresaClienteRow].sort((a, b) => a.nome.localeCompare(b.nome)));
    return data as EmpresaClienteRow;
  }, []);

  const update = useCallback(async (id: string, updates: EmpresaClienteUpdate) => {
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table: any = supabase.from('empresas_clientes');
    const { data, error: err } = await table
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    setEmpresas(prev => prev.map(e => (e.id === id ? (data as EmpresaClienteRow) : e)));
    return data as EmpresaClienteRow;
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    const { error: err } = await supabase
      .from('empresas_clientes')
      .delete()
      .eq('id', id);
    if (err) {
      setError(err.message);
      return false;
    }
    setEmpresas(prev => prev.filter(e => e.id !== id));
    return true;
  }, []);

  /** Retorna apenas empresas ativas */
  const ativas = empresas.filter(e => e.status === 'ativo');

  /** Mapa id → nome para lookups rápidos */
  const empresasMap: Record<string, string> = {};
  for (const e of empresas) {
    empresasMap[e.id] = e.nome;
  }

  return { empresas, ativas, empresasMap, loading, error, fetchAll, create, update, remove };
}
