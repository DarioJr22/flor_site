import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { deleteImage, BUCKETS } from '../lib/storage';
import type { PromoBannerRow, PromoBannerInsert, PromoBannerUpdate } from '../lib/database.types';

export function usePromoBanners() {
  const [banners, setBanners] = useState<PromoBannerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('promo_banners')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setBanners(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (banner: PromoBannerInsert) => {
    setError(null);
    const { data, error: err } = await supabase.from('promo_banners').insert(banner).select().single();
    if (err) { setError(err.message); return null; }
    setBanners(prev => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, updates: PromoBannerUpdate) => {
    setError(null);
    const { data, error: err } = await supabase
      .from('promo_banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    setBanners(prev => prev.map(b => (b.id === id ? data : b)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    const banner = banners.find(b => b.id === id);
    const { error: err } = await supabase.from('promo_banners').delete().eq('id', id);
    if (err) { setError(err.message); return false; }
    if (banner?.image_path) {
      try { await deleteImage(BUCKETS.PROMO_BANNERS, banner.image_path); } catch { /* noop */ }
    }
    setBanners(prev => prev.filter(b => b.id !== id));
    return true;
  }, [banners]);

  return { banners, loading, error, fetchAll, create, update, remove };
}
