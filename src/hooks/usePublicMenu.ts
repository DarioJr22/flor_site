import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl, BUCKETS } from '../lib/storage';
import type { MenuItem } from '../lib/types';

/**
 * Hook público — busca itens do cardápio (disponíveis) do Supabase.
 * Retorna os dados já mapeados para o tipo MenuItem da aplicação.
 */
export function usePublicMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category')
        .order('name');

      if (data) {
        setItems(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description ?? '',
            price: Number(row.price),
            category: row.category,
            image: row.image_path ? getPublicUrl(BUCKETS.MENU_ITEMS, row.image_path) : '',
            badges: (row.badges as MenuItem['badges']) ?? [],
            available: row.available,
          }))
        );
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { items, loading };
}
