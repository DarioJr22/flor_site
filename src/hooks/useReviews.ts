import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { deleteImage, BUCKETS } from '../lib/storage';
import type { ReviewRow, ReviewInsert, ReviewUpdate } from '../lib/database.types';

export function useReviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setReviews(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (review: ReviewInsert) => {
    setError(null);
    const { data, error: err } = await supabase.from('reviews').insert(review).select().single();
    if (err) { setError(err.message); return null; }
    setReviews(prev => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, updates: ReviewUpdate) => {
    setError(null);
    const { data, error: err } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    setReviews(prev => prev.map(r => (r.id === id ? data : r)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    const review = reviews.find(r => r.id === id);
    const { error: err } = await supabase.from('reviews').delete().eq('id', id);
    if (err) { setError(err.message); return false; }
    if (review?.avatar_path) {
      try { await deleteImage(BUCKETS.REVIEWS, review.avatar_path); } catch { /* noop */ }
    }
    setReviews(prev => prev.filter(r => r.id !== id));
    return true;
  }, [reviews]);

  return { reviews, loading, error, fetchAll, create, update, remove };
}
