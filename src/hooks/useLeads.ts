import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { LeadRow, LeadInsert, LeadUpdate } from '../lib/database.types';

export function useLeads() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setLeads(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (lead: LeadInsert) => {
    setError(null);
    const { data, error: err } = await supabase.from('leads').insert(lead).select().single();
    if (err) { setError(err.message); return null; }
    setLeads(prev => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, updates: LeadUpdate) => {
    setError(null);
    const { data, error: err } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    setLeads(prev => prev.map(l => (l.id === id ? data : l)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    const { error: err } = await supabase.from('leads').delete().eq('id', id);
    if (err) { setError(err.message); return false; }
    setLeads(prev => prev.filter(l => l.id !== id));
    return true;
  }, []);

  return { leads, loading, error, fetchAll, create, update, remove };
}
