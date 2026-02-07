import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { deleteImage, BUCKETS } from '../lib/storage';
import type { MenuItemRow, MenuItemInsert, MenuItemUpdate } from '../lib/database.types';

export function useMenu() {
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');
    if (err) setError(err.message);
    else setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (item: MenuItemInsert) => {
    setError(null);
    const { data, error: err } = await supabase.from('menu_items').insert(item).select().single();
    if (err) { setError(err.message); return null; }
    setItems(prev => [...prev, data]);
    return data;
  }, []);

  const update = useCallback(async (id: string, updates: MenuItemUpdate) => {
    setError(null);
    const { data, error: err } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    setItems(prev => prev.map(i => (i.id === id ? data : i)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    // Find item to delete its image from storage
    const item = items.find(i => i.id === id);
    const { error: err } = await supabase.from('menu_items').delete().eq('id', id);
    if (err) { setError(err.message); return false; }
    // Clean up storage image
    if (item?.image_path) {
      try { await deleteImage(BUCKETS.MENU_ITEMS, item.image_path); } catch { /* noop */ }
    }
    setItems(prev => prev.filter(i => i.id !== id));
    return true;
  }, [items]);

  return { items, loading, error, fetchAll, create, update, remove };
}
