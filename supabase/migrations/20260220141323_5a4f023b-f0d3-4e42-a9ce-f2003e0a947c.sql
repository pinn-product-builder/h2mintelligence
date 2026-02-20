
-- =============================================
-- FASE 1: Tabelas Normalizadas para Ingestão de Dados
-- =============================================

-- 1. Dimensão Período
CREATE TABLE public.dim_periodo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  trimestre INTEGER GENERATED ALWAYS AS (CEIL(mes::NUMERIC / 3)::INTEGER) STORED,
  label TEXT,
  data_inicio DATE,
  data_fim DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ano, mes)
);

ALTER TABLE public.dim_periodo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dim_periodo" ON public.dim_periodo
  FOR SELECT USING (true);

CREATE POLICY "Admins and gestors can manage dim_periodo" ON public.dim_periodo
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- 2. Dimensão Região
CREATE TABLE public.dim_regiao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  estado TEXT,
  codigo_ibge TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(nome)
);

ALTER TABLE public.dim_regiao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dim_regiao" ON public.dim_regiao
  FOR SELECT USING (true);

CREATE POLICY "Admins and gestors can manage dim_regiao" ON public.dim_regiao
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- 3. Fact Financeiro
CREATE TABLE public.fact_financeiro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_id UUID REFERENCES public.dim_periodo(id),
  sector_id UUID REFERENCES public.sectors(id),
  regiao_id UUID REFERENCES public.dim_regiao(id),
  tipo TEXT NOT NULL,
  subtipo TEXT,
  valor NUMERIC NOT NULL,
  meta NUMERIC,
  moeda TEXT DEFAULT 'BRL',
  fonte TEXT,
  import_log_id UUID REFERENCES public.import_logs(id),
  extras JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  imported_by UUID
);

ALTER TABLE public.fact_financeiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fact_financeiro" ON public.fact_financeiro
  FOR SELECT USING (true);

CREATE POLICY "Admins and gestors can insert fact_financeiro" ON public.fact_financeiro
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins can delete fact_financeiro" ON public.fact_financeiro
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and gestors can update fact_financeiro" ON public.fact_financeiro
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- 4. Fact Operacional
CREATE TABLE public.fact_operacional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_id UUID REFERENCES public.dim_periodo(id),
  sector_id UUID REFERENCES public.sectors(id),
  tipo TEXT NOT NULL,
  item TEXT,
  quantidade NUMERIC,
  valor_unitario NUMERIC,
  valor_total NUMERIC,
  classificacao TEXT,
  fonte TEXT,
  import_log_id UUID REFERENCES public.import_logs(id),
  extras JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  imported_by UUID
);

ALTER TABLE public.fact_operacional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fact_operacional" ON public.fact_operacional
  FOR SELECT USING (true);

CREATE POLICY "Admins and gestors can insert fact_operacional" ON public.fact_operacional
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins can delete fact_operacional" ON public.fact_operacional
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and gestors can update fact_operacional" ON public.fact_operacional
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- 5. Fact Marketing
CREATE TABLE public.fact_marketing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_id UUID REFERENCES public.dim_periodo(id),
  canal TEXT,
  tipo TEXT NOT NULL,
  nome_campanha TEXT,
  leads INTEGER,
  conversoes INTEGER,
  investimento NUMERIC,
  cac NUMERIC,
  roi NUMERIC,
  fonte TEXT,
  import_log_id UUID REFERENCES public.import_logs(id),
  extras JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  imported_by UUID
);

ALTER TABLE public.fact_marketing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fact_marketing" ON public.fact_marketing
  FOR SELECT USING (true);

CREATE POLICY "Admins and gestors can insert fact_marketing" ON public.fact_marketing
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins can delete fact_marketing" ON public.fact_marketing
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and gestors can update fact_marketing" ON public.fact_marketing
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- 6. Indexes para performance
CREATE INDEX idx_fact_financeiro_periodo ON public.fact_financeiro(periodo_id);
CREATE INDEX idx_fact_financeiro_tipo ON public.fact_financeiro(tipo);
CREATE INDEX idx_fact_financeiro_sector ON public.fact_financeiro(sector_id);

CREATE INDEX idx_fact_operacional_periodo ON public.fact_operacional(periodo_id);
CREATE INDEX idx_fact_operacional_tipo ON public.fact_operacional(tipo);

CREATE INDEX idx_fact_marketing_periodo ON public.fact_marketing(periodo_id);
CREATE INDEX idx_fact_marketing_tipo ON public.fact_marketing(tipo);

-- 7. Views consolidadas para dashboards

-- View: Resumo financeiro por período
CREATE OR REPLACE VIEW public.vw_financeiro_resumo AS
SELECT 
  p.ano,
  p.mes,
  p.trimestre,
  p.label AS periodo_label,
  s.name AS setor,
  r.nome AS regiao,
  f.tipo,
  f.subtipo,
  SUM(f.valor) AS total_valor,
  SUM(f.meta) AS total_meta,
  CASE WHEN SUM(f.meta) > 0 THEN ROUND((SUM(f.valor) / SUM(f.meta)) * 100, 1) ELSE NULL END AS atingimento_pct,
  COUNT(*) AS registros
FROM public.fact_financeiro f
LEFT JOIN public.dim_periodo p ON f.periodo_id = p.id
LEFT JOIN public.sectors s ON f.sector_id = s.id
LEFT JOIN public.dim_regiao r ON f.regiao_id = r.id
GROUP BY p.ano, p.mes, p.trimestre, p.label, s.name, r.nome, f.tipo, f.subtipo;

-- View: Resumo operacional por período
CREATE OR REPLACE VIEW public.vw_operacional_resumo AS
SELECT 
  p.ano,
  p.mes,
  p.trimestre,
  p.label AS periodo_label,
  s.name AS setor,
  o.tipo,
  o.classificacao,
  SUM(o.quantidade) AS total_quantidade,
  SUM(o.valor_total) AS total_valor,
  AVG(o.valor_unitario) AS avg_valor_unitario,
  COUNT(*) AS registros
FROM public.fact_operacional o
LEFT JOIN public.dim_periodo p ON o.periodo_id = p.id
LEFT JOIN public.sectors s ON o.sector_id = s.id
GROUP BY p.ano, p.mes, p.trimestre, p.label, s.name, o.tipo, o.classificacao;

-- View: Resumo marketing por período
CREATE OR REPLACE VIEW public.vw_marketing_resumo AS
SELECT 
  p.ano,
  p.mes,
  p.trimestre,
  p.label AS periodo_label,
  m.canal,
  m.tipo,
  SUM(m.leads) AS total_leads,
  SUM(m.conversoes) AS total_conversoes,
  SUM(m.investimento) AS total_investimento,
  CASE WHEN SUM(m.leads) > 0 THEN ROUND(SUM(m.investimento) / SUM(m.leads), 2) ELSE NULL END AS cpl,
  CASE WHEN SUM(m.conversoes) > 0 THEN ROUND(SUM(m.investimento) / SUM(m.conversoes), 2) ELSE NULL END AS cac_calculado,
  AVG(m.roi) AS avg_roi,
  COUNT(*) AS registros
FROM public.fact_marketing m
LEFT JOIN public.dim_periodo p ON m.periodo_id = p.id
GROUP BY p.ano, p.mes, p.trimestre, p.label, m.canal, m.tipo;

-- 8. Seed: popular dim_periodo com 2025-2027
INSERT INTO public.dim_periodo (ano, mes, label, data_inicio, data_fim)
SELECT 
  y.ano, 
  m.mes,
  TO_CHAR(MAKE_DATE(y.ano, m.mes, 1), 'Mon') || '/' || y.ano,
  MAKE_DATE(y.ano, m.mes, 1),
  (MAKE_DATE(y.ano, m.mes, 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
FROM (VALUES (2025), (2026), (2027)) AS y(ano)
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) AS m(mes);
