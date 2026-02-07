-- ============================================================
-- Migration 002 — Supabase Storage Setup
-- Execute this file in the Supabase SQL Editor
-- ============================================================

-- 1. CREATE STORAGE BUCKETS
-- ----------------------------------------------------------
-- Using the storage.buckets table directly.
-- All buckets are public (images are served to anonymous visitors).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('landing-page',   'landing-page',   true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('menu-items',     'menu-items',     true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('promo-banners',  'promo-banners',  true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('reviews',        'reviews',        true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('general',        'general',        true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;


-- 2. STORAGE RLS POLICIES
-- ----------------------------------------------------------
-- Public: anyone can read (SELECT) files from all public buckets.
-- Authenticated: only logged-in users can INSERT, UPDATE, DELETE.

-- ---- Generic SELECT policy (public read) ----
CREATE POLICY "public_read_landing_page"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'landing-page');

CREATE POLICY "public_read_menu_items"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-items');

CREATE POLICY "public_read_promo_banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'promo-banners');

CREATE POLICY "public_read_reviews"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reviews');

CREATE POLICY "public_read_general"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'general');

-- ---- Authenticated INSERT ----
CREATE POLICY "auth_insert_landing_page"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'landing-page');

CREATE POLICY "auth_insert_menu_items"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'menu-items');

CREATE POLICY "auth_insert_promo_banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'promo-banners');

CREATE POLICY "auth_insert_reviews"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reviews');

CREATE POLICY "auth_insert_general"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'general');

-- ---- Authenticated UPDATE ----
CREATE POLICY "auth_update_landing_page"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'landing-page')
  WITH CHECK (bucket_id = 'landing-page');

CREATE POLICY "auth_update_menu_items"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'menu-items')
  WITH CHECK (bucket_id = 'menu-items');

CREATE POLICY "auth_update_promo_banners"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'promo-banners')
  WITH CHECK (bucket_id = 'promo-banners');

CREATE POLICY "auth_update_reviews"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'reviews')
  WITH CHECK (bucket_id = 'reviews');

CREATE POLICY "auth_update_general"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'general')
  WITH CHECK (bucket_id = 'general');

-- ---- Authenticated DELETE ----
CREATE POLICY "auth_delete_landing_page"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'landing-page');

CREATE POLICY "auth_delete_menu_items"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'menu-items');

CREATE POLICY "auth_delete_promo_banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'promo-banners');

CREATE POLICY "auth_delete_reviews"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'reviews');

CREATE POLICY "auth_delete_general"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'general');


-- 3. SCHEMA CHANGES — Rename image/avatar columns to clarify they hold storage paths
-- ----------------------------------------------------------
-- The column stays as TEXT. Existing values (full URLs) will continue to work
-- because the getPublicUrl helper passes through absolute URLs unchanged.
-- No data is lost; this simply clarifies intent.

-- NOTE: If the columns have already been renamed (re-running migration), the
-- DO block catches the error and continues.

DO $$ BEGIN
  ALTER TABLE menu_items    RENAME COLUMN image TO image_path;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE promo_banners RENAME COLUMN image TO image_path;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE reviews       RENAME COLUMN avatar TO avatar_path;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;


-- ============================================================
-- END OF MIGRATION 002
-- ============================================================
