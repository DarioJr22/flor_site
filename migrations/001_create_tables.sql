-- ============================================================
-- Flor do Maracujá — Database Migrations
-- Execute this file in the Supabase SQL Editor
-- ============================================================

-- 1. ENUMS
-- ------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE badge_type AS ENUM ('bestseller', 'new', 'spicy');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 2. TABLES
-- ------------------------------------------------------------

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category    TEXT NOT NULL,
  image       TEXT,
  badges      badge_type[] DEFAULT '{}',
  available   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items (available);

-- Promo Banners
CREATE TABLE IF NOT EXISTS promo_banners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  image       TEXT,
  active      BOOLEAN DEFAULT TRUE,
  valid_until TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_banners_active ON promo_banners (active);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items            JSONB NOT NULL,
  total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  customer_name    TEXT,
  customer_phone   TEXT,
  customer_address TEXT,
  promo_code       TEXT,
  status           order_status DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  date       TEXT,
  approved   BOOLEAN DEFAULT FALSE,
  avatar     TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews (approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating);

-- Leads (Clientes Especiais)
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  birthday    TEXT,
  preferences TEXT,
  promo_code  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);


-- 3. UPDATED_AT TRIGGER
-- ------------------------------------------------------------
-- Automatically sets updated_at on every UPDATE

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['menu_items', 'promo_banners', 'orders', 'reviews']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END $$;


-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE menu_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads         ENABLE ROW LEVEL SECURITY;

-- ---- menu_items ----
-- Public: anyone can read available items
CREATE POLICY "menu_items_public_select"
  ON menu_items FOR SELECT
  USING (true);

-- Admin: authenticated users can do everything
CREATE POLICY "menu_items_admin_insert"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "menu_items_admin_update"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "menu_items_admin_delete"
  ON menu_items FOR DELETE
  TO authenticated
  USING (true);


-- ---- promo_banners ----
-- Public: anyone can read active banners
CREATE POLICY "promo_banners_public_select"
  ON promo_banners FOR SELECT
  USING (true);

-- Admin: full access
CREATE POLICY "promo_banners_admin_insert"
  ON promo_banners FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "promo_banners_admin_update"
  ON promo_banners FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "promo_banners_admin_delete"
  ON promo_banners FOR DELETE
  TO authenticated
  USING (true);


-- ---- orders ----
-- Only authenticated users can manage orders
CREATE POLICY "orders_admin_select"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "orders_admin_insert"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "orders_admin_delete"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous order creation (customers placing orders)
CREATE POLICY "orders_anon_insert"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);


-- ---- reviews ----
-- Public: anyone can read approved reviews
CREATE POLICY "reviews_public_select"
  ON reviews FOR SELECT
  USING (approved = true);

-- Admin: full access (including unapproved)
CREATE POLICY "reviews_admin_select"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "reviews_admin_insert"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "reviews_admin_update"
  ON reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "reviews_admin_delete"
  ON reviews FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous review submission
CREATE POLICY "reviews_anon_insert"
  ON reviews FOR INSERT
  TO anon
  WITH CHECK (true);


-- ---- leads ----
-- Only authenticated users can view leads
CREATE POLICY "leads_admin_select"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "leads_admin_insert"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "leads_admin_update"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "leads_admin_delete"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous lead signup (from the public form)
CREATE POLICY "leads_anon_insert"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);


-- 5. SEED DATA (optional — remove if not needed)
-- ------------------------------------------------------------

INSERT INTO menu_items (name, description, price, category, image, badges, available) VALUES
  ('Moqueca de Camarão', 'Deliciosa moqueca capixaba com camarões frescos, leite de coco, dendê e temperos especiais. Acompanha arroz branco e pirão.', 89.90, 'Pratos Principais', 'https://images.unsplash.com/photo-1762305194194-6896afafecb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', '{bestseller,spicy}', true),
  ('Picanha na Chapa', 'Suculenta picanha grelhada na perfeição, acompanhada de arroz, feijão tropeiro, farofa crocante e vinagrete.', 79.90, 'Pratos Principais', 'https://images.unsplash.com/photo-1663213990116-a43ddb308859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', '{bestseller}', true),
  ('Feijoada Completa', 'Tradicional feijoada brasileira servida com arroz, couve refogada, farofa, laranja e torresmo.', 65.90, 'Pratos Principais', 'https://images.unsplash.com/photo-1705313381636-672463bfa6fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', '{bestseller}', true),
  ('Baião de Dois', 'Arroz com feijão verde, queijo coalho, carne de sol desfiada e temperos nordestinos.', 54.90, 'Pratos Principais', 'https://images.unsplash.com/photo-1675106643937-791e74751488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', '{new}', true),
  ('Bolinho de Bacalhau', 'Tradicionais bolinhos de bacalhau crocantes servidos com molho de pimenta especial da casa (6 unidades).', 32.90, 'Entradas', 'https://images.unsplash.com/photo-1675106643937-791e74751488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', '{bestseller}', true),
  ('Pudim de Leite', 'Clássico pudim de leite condensado com calda de caramelo suave.', 18.90, 'Sobremesas', 'https://images.unsplash.com/photo-1675106643937-791e74751488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', '{}', true),
  ('Suco de Maracujá', 'Suco natural de maracujá feito na hora (400ml).', 12.90, 'Bebidas', 'https://images.unsplash.com/photo-1675106643937-791e74751488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', '{bestseller}', true)
ON CONFLICT DO NOTHING;

INSERT INTO promo_banners (title, description, image, active, valid_until) VALUES
  ('🌺 Feijoada aos Sábados', 'Feijoada completa por apenas R$49,90. Todos os sábados!', 'https://images.unsplash.com/photo-1705313381636-672463bfa6fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', true, '2026-12-31'),
  ('🎉 Happy Hour', 'Chopp e petiscos com 30% de desconto das 17h às 19h.', 'https://images.unsplash.com/photo-1675106643937-791e74751488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', true, '2026-06-30')
ON CONFLICT DO NOTHING;

INSERT INTO reviews (name, rating, comment, date, approved, avatar) VALUES
  ('Maria Silva', 5, 'Melhor moqueca que já comi! Ambiente super acolhedor e atendimento impecável.', '2025-11-15', true, null),
  ('João Santos', 4, 'Feijoada maravilhosa! Voltarei com certeza. Só faltou um pouco mais de farofa.', '2025-12-01', true, null),
  ('Ana Oliveira', 5, 'O pudim é divino! Receita da vovó mesmo. Recomendo demais!', '2026-01-10', true, null)
ON CONFLICT DO NOTHING;


-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
