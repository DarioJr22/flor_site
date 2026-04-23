-- ============================================================
-- Flor do Maracujá — Tickets Empresariais
-- Migration 003: Tabelas para gestão de tickets de alimentação
-- Execute este arquivo no Supabase SQL Editor
-- ============================================================

-- 1. TABELA: empresas_clientes
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS empresas_clientes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                VARCHAR(255) NOT NULL,
  cnpj                VARCHAR(18) UNIQUE,
  contato_nome        VARCHAR(255),
  contato_telefone    VARCHAR(20),
  contato_email       VARCHAR(255),
  endereco_entrega    TEXT,
  dias_fornecimento   JSONB DEFAULT '["seg","ter","qua","qui","sex"]',
  horario_entrega     TIME DEFAULT '12:00',
  valor_ticket        DECIMAL(10,2) DEFAULT 25.00,
  status              VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  data_inicio_contrato DATE,
  observacoes         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas_clientes(status);
CREATE INDEX IF NOT EXISTS idx_empresas_nome ON empresas_clientes(nome);

-- 2. TABELA: tickets_alimentacao
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tickets_alimentacao (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        UUID REFERENCES empresas_clientes(id) ON DELETE CASCADE,
  nome_funcionario  VARCHAR(255) NOT NULL,
  carne             VARCHAR(255) NOT NULL,
  acompanhamentos   TEXT NOT NULL,
  data_refeicao     DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_registro     TIME DEFAULT CURRENT_TIME,
  status            VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'impresso', 'entregue', 'cancelado')),
  valor             DECIMAL(10,2),
  numero_ticket     VARCHAR(20) UNIQUE,
  observacoes       TEXT,
  impresso_em       TIMESTAMPTZ,
  impresso_por      UUID REFERENCES auth.users(id),
  lote_importacao   UUID,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_empresa ON tickets_alimentacao(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tickets_data ON tickets_alimentacao(data_refeicao);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets_alimentacao(status);
CREATE INDEX IF NOT EXISTS idx_tickets_lote ON tickets_alimentacao(lote_importacao);

-- 3. TRIGGER: gerar número de ticket sequencial por dia
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION gerar_numero_ticket()
RETURNS TRIGGER AS $$
DECLARE
  contador INT;
  data_ref DATE;
BEGIN
  data_ref := COALESCE(NEW.data_refeicao, CURRENT_DATE);
  
  SELECT COUNT(*) + 1 INTO contador
  FROM tickets_alimentacao
  WHERE data_refeicao = data_ref;
  
  NEW.numero_ticket := TO_CHAR(data_ref, 'YYYYMMDD') || '-' || LPAD(contador::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gerar_numero_ticket ON tickets_alimentacao;
CREATE TRIGGER trigger_gerar_numero_ticket
BEFORE INSERT ON tickets_alimentacao
FOR EACH ROW
EXECUTE FUNCTION gerar_numero_ticket();

-- 4. TRIGGER: atualizar updated_at automaticamente
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_empresas_updated_at ON empresas_clientes;
CREATE TRIGGER trigger_empresas_updated_at
BEFORE UPDATE ON empresas_clientes
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_tickets_updated_at ON tickets_alimentacao;
CREATE TRIGGER trigger_tickets_updated_at
BEFORE UPDATE ON tickets_alimentacao
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

-- 5. VIEW: relatório de consumo por empresa
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW vw_relatorio_consumo_empresas AS
SELECT 
  e.id AS empresa_id,
  e.nome AS empresa_nome,
  e.cnpj,
  COUNT(t.id) AS total_tickets,
  COALESCE(SUM(t.valor), 0) AS valor_total,
  COALESCE(AVG(t.valor), 0) AS ticket_medio,
  COUNT(DISTINCT t.data_refeicao) AS dias_atendidos,
  COUNT(DISTINCT t.nome_funcionario) AS funcionarios_unicos,
  DATE_TRUNC('month', t.data_refeicao) AS mes_referencia
FROM empresas_clientes e
LEFT JOIN tickets_alimentacao t ON e.id = t.empresa_id
GROUP BY e.id, e.nome, e.cnpj, DATE_TRUNC('month', t.data_refeicao);

-- 6. ROW LEVEL SECURITY
-- ------------------------------------------------------------

ALTER TABLE empresas_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_alimentacao ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas usuários autenticados podem acessar
CREATE POLICY "Authenticated users can read empresas"
  ON empresas_clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert empresas"
  ON empresas_clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update empresas"
  ON empresas_clientes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete empresas"
  ON empresas_clientes FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read tickets"
  ON tickets_alimentacao FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tickets"
  ON tickets_alimentacao FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tickets"
  ON tickets_alimentacao FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tickets"
  ON tickets_alimentacao FOR DELETE
  TO authenticated
  USING (true);
