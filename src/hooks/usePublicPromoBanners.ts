import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl, BUCKETS } from '../lib/storage';
import type { PromoBanner } from '../lib/types';

/**
 * Hook público — busca banners promocionais ativos do Supabase.
 * Mapeia valid_until (snake_case do DB) → validUntil (camelCase do frontend).
 */
export function usePublicPromoBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('promo_banners')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (data) {
        setBanners(
          data.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description ?? '',
            image: row.image_path ? getPublicUrl(BUCKETS.PROMO_BANNERS, row.image_path) : '',
            active: row.active,
            validUntil: row.valid_until ?? undefined,
          }))
        );
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { banners, loading };
}
