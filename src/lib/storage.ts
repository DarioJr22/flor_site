// ============================================================
// Supabase Storage Service — Flor do Maracujá
// Centralised helpers for upload, delete and public URL generation
// ============================================================

import { supabase } from './supabase';

// ----- Bucket names (must match what was created in Supabase) -----
export const BUCKETS = {
  LANDING_PAGE: 'landing-page',
  MENU_ITEMS: 'menu-items',
  PROMO_BANNERS: 'promo-banners',
  REVIEWS: 'reviews',
  GENERAL: 'general',
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

// ----- Allowed MIME types -----
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ----- Helpers -----

/**
 * Build the public URL for an image stored in Supabase Storage.
 * If `path` is already a full URL (http/https) it is returned as-is so that
 * legacy / external URLs keep working during the migration period.
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  if (!path) return '';
  // Already an absolute URL — return unchanged
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Build a resized / transformed URL via Supabase Image Transformations.
 * Falls back to the plain public URL when transformations aren't needed.
 */
export function getTransformedUrl(
  bucket: BucketName,
  path: string,
  options?: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill' },
): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: {
      width: options?.width ?? 800,
      height: options?.height ?? 600,
      quality: options?.quality ?? 80,
      resize: options?.resize ?? 'cover',
    },
  });
  return data.publicUrl;
}

/**
 * Validate a file before upload.
 * Returns an error string or `null` if valid.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Tipo de arquivo não suportado: ${file.type}. Use JPEG, PNG, WebP ou GIF.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo: 5 MB.`;
  }
  return null;
}

/**
 * Upload an image to Supabase Storage.
 *
 * @returns `{ path, publicUrl }` on success
 * @throws Error on validation / upload failure
 */
export async function uploadImage(
  file: File,
  bucket: BucketName,
  folder = '',
): Promise<{ path: string; publicUrl: string }> {
  // Validate
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  // Build unique file name
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  return {
    path: data.path,
    publicUrl: getPublicUrl(bucket, data.path),
  };
}

/**
 * Delete one or more images from Supabase Storage.
 */
export async function deleteImage(bucket: BucketName, path: string): Promise<void> {
  if (!path || path.startsWith('http://') || path.startsWith('https://')) return;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error('Erro ao deletar imagem:', error);
    throw error;
  }
}

/**
 * Replace an image: delete the old one and upload a new one.
 */
export async function replaceImage(
  file: File,
  bucket: BucketName,
  oldPath: string | null | undefined,
  folder = '',
): Promise<{ path: string; publicUrl: string }> {
  // Try to delete old image (ignore errors — file may already be gone)
  if (oldPath) {
    try { await deleteImage(bucket, oldPath); } catch { /* noop */ }
  }
  return uploadImage(file, bucket, folder);
}
