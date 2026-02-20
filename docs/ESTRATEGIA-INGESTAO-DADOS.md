# Estratégia de Ingestão de Dados — H2M Intelligence

> Documento técnico para alinhamento da equipe de integração.  
> Data: 2026-02-20 | Status: Proposta para revisão

---

## 1. Contexto e Objetivo

Definir a estratégia de ingestão de dados considerando a implementação manual (MVP) versus processos automatizados, além de estabelecer o padrão de normalização para integração e automação dos fluxos futuros.

**Meta**: garantir que as próximas etapas de automação e integração partam de processos bem definidos, facilitando evolução técnica e escalabilidade.

---

## 2. Estado Atual do Sistema

### 2.1 Componentes Implementados

| Componente | Status | Detalhes |
|---|---|---|
| Import Wizard | ✅ Funcional | Upload CSV/XLSX com preview e validação |
| Mapeamento de colunas | ✅ Funcional | Auto-sugestão por nome + transformações (SUM, AVG, MIN, MAX, COUNT, date_format) |
| Validação de dados | ✅ Funcional | Tipo de dado, campos obrigatórios, formatos de data/moeda |
| Logs de auditoria | ✅ Funcional | Tabela `import_logs` no Supabase com rastreio completo |
| Controle de acesso | ✅ Funcional | Restrito a perfis `admin` e `gestor` |
| Armazenamento | ⚠️ Genérico | Dados salvos em `imported_metrics.data` (JSONB) |

### 2.2 Tabelas-Alvo Definidas

```
Financeiro:    Faturamento Mensal, Custos Operacionais, DRE
Operações:     Giro de Estoque, Curva ABC
Marketing:     Leads Marketing, Campanhas
Geral:         Metas por Setor
```

### 2.3 Campos do Sistema (Mapeáveis)

| Campo | Tipo | Obrigatório | Categoria |
|---|---|---|---|
| Valor | currency | Sim | Financeiro |
| Meta | currency | Não | Financeiro |
| Data | date | Sim | Geral |
| Período | text | Não | Geral |
| Setor | text | Não | Geral |
| Região | text | Não | Geral |
| Quantidade | number | Não | Operações |
| Percentual | percentage | Não | Geral |
| Status | text | Não | Geral |
| Descrição | text | Não | Geral |

---

## 3. Análise: MVP Manual vs. Automação

### 3.1 MVP Manual (Abordagem Atual)

**Prós:**
- Já está implementado e funcional
- Flexibilidade para adaptar formatos de entrada
- Baixo custo de manutenção inicial
- Permite validar o modelo de dados antes de automatizar

**Contras:**
- Dependência de ação humana para cada importação
- Risco de erro na preparação de planilhas
- Não escalável para volumes altos ou frequência diária
- Dados armazenados em JSONB sem normalização

### 3.2 Automação Desde o Início

**Prós:**
- Eliminação de erros manuais
- Frequência de atualização configurável
- Escalável desde o primeiro momento

**Contras:**
- Custo de desenvolvimento significativamente maior
- Requer definição rígida de schema antes de implementar
- Dependência de APIs ou conectores que podem não existir ainda
- Complexidade prematura para o estágio atual do produto

### 3.3 Recomendação

> **MVP Manual com normalização progressiva.**
> 
> Manter o fluxo manual atual, mas evoluir o armazenamento de JSONB genérico para tabelas normalizadas por domínio. Isso permite que o MVP funcione imediatamente enquanto prepara a estrutura para automação futura.

---

## 4. Estratégia de Normalização

### 4.1 Padrão Proposto: 3NF com Dimensões Compartilhadas

```
┌─────────────────────────────────────────────────────┐
│                  DIMENSÕES (Compartilhadas)         │
├─────────────────────────────────────────────────────┤
│  dim_periodo    → id, ano, mes, trimestre, label    │
│  dim_setor      → (já existe: tabela sectors)       │
│  dim_regiao     → id, nome, estado, codigo_ibge     │
│  dim_responsavel→ (já existe: tabela profiles)      │
└─────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  FATOS       │ │  FATOS       │ │  FATOS       │
│  Financeiro  │ │  Operacional │ │  Marketing   │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ faturamento  │ │ estoque      │ │ leads        │
│ custos       │ │ producao     │ │ campanhas    │
│ dre          │ │ curva_abc    │ │ conversoes   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 4.2 Schema Proposto por Domínio

#### Financeiro — `fact_financeiro`

```sql
CREATE TABLE fact_financeiro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_id UUID REFERENCES dim_periodo(id),
  sector_id UUID REFERENCES sectors(id),
  regiao_id UUID REFERENCES dim_regiao(id),
  tipo TEXT NOT NULL,          -- 'faturamento' | 'custo' | 'dre_linha'
  subtipo TEXT,                -- 'receita_bruta' | 'custo_fixo' | etc.
  valor NUMERIC NOT NULL,
  meta NUMERIC,
  moeda TEXT DEFAULT 'BRL',
  fonte TEXT,                  -- arquivo de origem
  import_log_id UUID REFERENCES import_logs(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Operacional — `fact_operacional`

```sql
CREATE TABLE fact_operacional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_id UUID REFERENCES dim_periodo(id),
  sector_id UUID REFERENCES sectors(id),
  tipo TEXT NOT NULL,          -- 'estoque' | 'producao' | 'curva_abc'
  item TEXT,
  quantidade NUMERIC,
  valor_unitario NUMERIC,
  valor_total NUMERIC,
  classificacao TEXT,          -- A, B, C (curva ABC)
  fonte TEXT,
  import_log_id UUID REFERENCES import_logs(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Marketing — `fact_marketing`

```sql
CREATE TABLE fact_marketing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_id UUID REFERENCES dim_periodo(id),
  canal TEXT,                  -- 'google_ads' | 'meta' | 'organico'
  tipo TEXT NOT NULL,          -- 'lead' | 'campanha' | 'conversao'
  nome_campanha TEXT,
  leads INTEGER,
  conversoes INTEGER,
  investimento NUMERIC,
  cac NUMERIC,                -- custo de aquisição
  roi NUMERIC,
  fonte TEXT,
  import_log_id UUID REFERENCES import_logs(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Dimensão Período — `dim_periodo`

```sql
CREATE TABLE dim_periodo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  trimestre INTEGER GENERATED ALWAYS AS (CEIL(mes::NUMERIC / 3)) STORED,
  label TEXT,                  -- 'Jan/2026', 'Q1 2026'
  data_inicio DATE,
  data_fim DATE,
  UNIQUE(ano, mes)
);
```

### 4.3 Migração do JSONB Atual

A migração do `imported_metrics.data` (JSONB) para tabelas normalizadas pode ser feita progressivamente:

1. **Fase 1**: Criar tabelas normalizadas + `dim_periodo`
2. **Fase 2**: Atualizar o Import Wizard para gravar nas novas tabelas
3. **Fase 3**: Criar script de migração para dados existentes no JSONB
4. **Fase 4**: Deprecar uso direto de `imported_metrics` para consultas

---

## 5. Fontes de Dados Prioritárias

### 5.1 Mapeamento de Fontes

| Prioridade | Fonte | Formato Atual | Formato Futuro | Frequência |
|---|---|---|---|---|
| 🔴 Alta | Planilhas financeiras (DRE, faturamento) | CSV/XLSX manual | API ERP | Mensal |
| 🔴 Alta | Dados de CRM/vendas | CSV/XLSX manual | API CRM (HubSpot, Pipedrive) | Semanal |
| 🟡 Média | Indicadores operacionais | CSV/XLSX manual | API ERP / IoT | Mensal |
| 🟡 Média | Marketing digital | CSV/XLSX manual | API Google Ads, Meta Ads | Semanal |

### 5.2 Formatos Suportados

| Formato | Suporte Atual | Observações |
|---|---|---|
| CSV (UTF-8, ;/,/tab) | ✅ Completo | Parser com detecção de separador |
| XLSX/XLS | ✅ Completo | SheetJS integrado com parsing real |
| PDF | ⚠️ Parcial | Parser de documentos existe, mas não integrado ao Data Hub |
| API REST | ❌ Futuro | Requer edge functions + agendamento |
| Webhook | ❌ Futuro | Requer endpoint + validação |

### 5.3 Compatibilidade com Integrações Futuras

| Integração | Protocolo | Dados | Prioridade |
|---|---|---|---|
| n8n (automação) | MCP / Webhook | Orquestração de fluxos | Alta |
| ERP (Omie, Bling, Sankhya) | REST API | Financeiro + Operacional | Média |
| CRM (HubSpot, Pipedrive) | REST API | Vendas + Leads | Média |
| Google Ads / Meta Ads | REST API | Marketing | Baixa |
| Google Sheets | REST API | Qualquer | Baixa |

---

## 6. Roadmap de Implementação

### Fase 1 — Normalização ✅ CONCLUÍDA
- [x] Criar tabelas `dim_periodo`, `dim_regiao`, `fact_financeiro`, `fact_operacional`, `fact_marketing`
- [x] Aplicar RLS (admin/gestor para escrita, leitura pública)
- [x] Atualizar Import Wizard para gravar em tabelas normalizadas (`normalizedImport.ts`)
- [x] Criar views SQL (`vw_financeiro_resumo`, `vw_operacional_resumo`, `vw_marketing_resumo`)
- [x] Conectar dashboard/indicadores às views normalizadas (com fallback para mock)

### Fase 2 — Robustez ✅ CONCLUÍDA
- [x] Integrar SheetJS para parsing real de XLSX
- [x] Adicionar templates de importação por tipo de dado
- [x] Implementar rollback de importação (desfazer lote)
- [x] Criar preview de dados pós-transformação antes de confirmar

### Fase 3 — Semi-automação (3-4 semanas)
- [ ] Criar edge functions para receber dados via webhook
- [ ] Integrar n8n para orquestração de importações agendadas
- [ ] Notificações (email/in-app) para erros de importação
- [ ] Dashboard de monitoramento de ingestão

### Fase 4 — Integração Total (4-6 semanas)
- [ ] Conectores para ERPs (Omie, Bling)
- [ ] Conectores para CRMs (HubSpot, Pipedrive)
- [ ] Conectores para plataformas de ads
- [ ] ETL automatizado com transformações configuráveis

---

## 7. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Schema rígido demais | Bloqueio ao receber dados inesperados | Manter coluna `extras JSONB` em cada fact table |
| Dados inconsistentes entre fontes | Métricas incorretas | Validação rigorosa + logs de importação |
| Volume alto sem automação | Gargalo operacional | Priorizar automação por frequência de uso |
| Mudança de ERP/CRM | Retrabalho nos conectores | Camada de abstração entre conector e schema |

---

## 8. Decisões Pendentes

- [ ] **Definir ERPs/CRMs alvo** para conectores da Fase 4
- [ ] **Validar schema normalizado** com stakeholders de dados
- [ ] **Definir SLAs de atualização** por tipo de dado (diário, semanal, mensal)
- [ ] **Aprovar investimento** em libs (SheetJS) e infra (n8n)

---

## 9. Próximos Passos

1. ✉️ **Compartilhar este documento** com a equipe de integração
2. 📅 **Agendar reunião de alinhamento** para validar schema e prioridades
3. 🔧 **Iniciar Fase 1** após aprovação (criação das tabelas normalizadas)

---

*Documento gerado pelo sistema H2M Intelligence. Sujeito a revisão e aprovação da equipe técnica.*
