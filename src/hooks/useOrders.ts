import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { OrderRow, OrderInsert, OrderUpdate } from '../lib/database.types';

export function useOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (order: OrderInsert) => {
    setError(null);
    const { data, error: err } = await supabase.from('orders').insert(order).select().single();
    if (err) { setError(err.message); return null; }
    setOrders(prev => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, updates: OrderUpdate) => {
    setError(null);
    const { data, error: err } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    setOrders(prev => prev.map(o => (o.id === id ? data : o)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    const { error: err } = await supabase.from('orders').delete().eq('id', id);
    if (err) { setError(err.message); return false; }
    setOrders(prev => prev.filter(o => o.id !== id));
    return true;
  }, []);

  return { orders, loading, error, fetchAll, create, update, remove };
}
