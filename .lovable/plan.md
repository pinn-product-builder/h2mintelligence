
# Sistema de Views Personalizadas para OKRs e Dashboards

## Visao Geral

Este plano implementa um sistema completo de **views personalizadas** que permite aos usuarios criar, salvar e gerenciar visualizacoes customizadas tanto para OKRs quanto para Dashboards, com persistencia no Supabase.

---

## Arquitetura da Solucao

```text
+------------------+     +-------------------+     +------------------+
|   user_views     |     | dashboard_configs |     |   view_widgets   |
+------------------+     +-------------------+     +------------------+
| id (uuid)        |     | id (uuid)         |     | id (uuid)        |
| user_id (uuid)   |     | view_id (uuid) FK |---->| view_id (uuid)   |
| name (text)      |     | layout (jsonb)    |     | type (text)      |
| type (enum)      |     | widgets (jsonb[]) |     | config (jsonb)   |
| filters (jsonb)  |     | created_at        |     | position (int)   |
| is_default (bool)|     | updated_at        |     | size (text)      |
| is_shared (bool) |     +-------------------+     +------------------+
| shared_with (uuid[])
| created_at       |
| updated_at       |
+------------------+
```

---

## Funcionalidades Principais

### 1. Views de OKRs
- **Filtros Salvos**: Ciclo, Setor, Status, Responsavel, Busca textual
- **Modo de Visualizacao**: Grid ou Lista (preferencia salva)
- **Ordenacao**: Por progresso, data de criacao, status
- **Views Padrao**: Cada usuario pode ter 1 view padrao que carrega automaticamente

### 2. Dashboards Personalizados
- **Widgets Configuraveis**: Metricas, OKRs por setor, graficos de progresso
- **Layout Drag-and-Drop**: Reorganizar widgets na tela
- **Filtros Globais**: Periodo, setor, responsavel
- **Views por Setor**: Dashboard especifico por area (Comercial, Marketing, etc.)

### 3. Compartilhamento
- **Views Privadas**: Apenas o criador ve
- **Views Compartilhadas**: Compartilhar com usuarios especificos
- **Views Publicas (Gestor+)**: Visiveis para toda a organizacao

---

## Implementacao Tecnica

### Fase 1: Banco de Dados

**Nova Tabela: `user_views`**
```sql
create type view_type as enum ('okr', 'dashboard');

create table public.user_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type view_type not null,
  filters jsonb default '{}',
  layout jsonb default '{}',
  is_default boolean default false,
  is_shared boolean default false,
  shared_with uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies
alter table public.user_views enable row level security;

-- Usuarios podem ver suas proprias views
create policy "Users can view own views"
  on public.user_views for select
  using (user_id = auth.uid());

-- Usuarios podem ver views compartilhadas com eles
create policy "Users can view shared views"
  on public.user_views for select
  using (auth.uid() = any(shared_with));

-- Gestores podem ver views publicas
create policy "Gestors can view public views"
  on public.user_views for select
  using (is_shared = true and (
    has_role(auth.uid(), 'admin') or 
    has_role(auth.uid(), 'gestor')
  ));

-- CRUD para proprias views
create policy "Users can manage own views"
  on public.user_views for all
  using (user_id = auth.uid());
```

**Nova Tabela: `dashboard_widgets`**
```sql
create type widget_type as enum (
  'metric_card',
  'okr_list', 
  'sector_overview',
  'progress_chart',
  'quick_stats',
  'task_summary'
);

create table public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  view_id uuid references public.user_views(id) on delete cascade not null,
  type widget_type not null,
  title text,
  config jsonb default '{}',
  position integer default 0,
  size text default 'medium', -- small, medium, large, full
  created_at timestamptz default now()
);

alter table public.dashboard_widgets enable row level security;

create policy "Users can manage widgets through views"
  on public.dashboard_widgets for all
  using (
    exists (
      select 1 from public.user_views v 
      where v.id = view_id and v.user_id = auth.uid()
    )
  );
```

### Fase 2: Hooks e Estado

**Arquivo: `src/hooks/useViews.ts`**
```typescript
// Hooks para gerenciar views
export function useUserViews(type: 'okr' | 'dashboard')
export function useCreateView()
export function useUpdateView()
export function useDeleteView()
export function useSetDefaultView()
export function useDashboardWidgets(viewId: string)
```

### Fase 3: Componentes de UI

**Novos Componentes:**

1. **`src/components/views/ViewSelector.tsx`**
   - Dropdown para selecionar view salva
   - Botao "Salvar View Atual"
   - Opcao "Gerenciar Views"

2. **`src/components/views/ViewManager.tsx`**
   - Modal para listar, editar, excluir views
   - Configurar view padrao
   - Compartilhar com outros usuarios

3. **`src/components/views/SaveViewDialog.tsx`**
   - Dialog para salvar nova view
   - Nome, tipo, opcoes de compartilhamento

4. **`src/components/dashboard/DashboardBuilder.tsx`**
   - Interface para montar dashboard
   - Adicionar/remover widgets
   - Configurar cada widget

5. **`src/components/dashboard/WidgetConfig.tsx`**
   - Painel lateral de configuracao de widget
   - Filtros especificos por tipo de widget

### Fase 4: Integracao

**Atualizar `OKRsSection.tsx`:**
- Adicionar ViewSelector no toolbar
- Carregar filtros da view selecionada
- Salvar alteracoes de filtro como nova view

**Atualizar `Dashboard.tsx`:**
- Renderizar widgets dinamicamente
- Permitir modo de edicao (drag-and-drop)
- Salvar layout personalizado

---

## Estrutura de Dados (JSON)

### Filtros de OKR View
```json
{
  "cycleId": "uuid",
  "sectorIds": ["uuid"],
  "status": ["on-track", "attention"],
  "ownerIds": ["uuid"],
  "search": "texto",
  "viewMode": "grid",
  "sortBy": "progress",
  "sortOrder": "desc"
}
```

### Layout de Dashboard View
```json
{
  "columns": 3,
  "globalFilters": {
    "cycleId": "uuid",
    "sectorId": "uuid"
  }
}
```

### Config de Widget
```json
{
  "metricType": "okrs-on-track",
  "showTrend": true,
  "limit": 5
}
```

---

## Fluxo de Usuario

### Criar View de OKR:
1. Usuario aplica filtros (setor, status, busca)
2. Clica em "Salvar View"
3. Nomeia a view (ex: "Meus OKRs Comerciais")
4. Define se eh padrao
5. View aparece no seletor

### Criar Dashboard Personalizado:
1. Usuario clica em "Editar Dashboard"
2. Adiciona widgets da biblioteca
3. Configura cada widget (setor, metricas)
4. Arrasta para reorganizar
5. Clica em "Salvar" -> cria nova view

### Compartilhar View:
1. Usuario abre "Gerenciar Views"
2. Clica em compartilhar
3. Seleciona usuarios ou marca como publica
4. Usuarios selecionados veem a view no seletor

---

## Arquivos a Criar/Modificar

### Novos Arquivos:
- `src/hooks/useViews.ts` - Hooks de gerenciamento de views
- `src/components/views/ViewSelector.tsx` - Seletor de views
- `src/components/views/ViewManager.tsx` - Gerenciador de views
- `src/components/views/SaveViewDialog.tsx` - Dialog para salvar
- `src/components/dashboard/DashboardBuilder.tsx` - Editor visual
- `src/components/dashboard/WidgetLibrary.tsx` - Biblioteca de widgets
- `src/components/dashboard/WidgetRenderer.tsx` - Renderizador dinamico
- `src/types/views.ts` - Tipos TypeScript

### Arquivos a Modificar:
- `src/components/sections/OKRsSection.tsx` - Integrar ViewSelector
- `src/components/dashboard/Dashboard.tsx` - Suportar layout dinamico
- `src/hooks/useSupabaseData.ts` - Adicionar queries de views

---

## Ordem de Execucao

1. **Migracao SQL** - Criar tabelas `user_views` e `dashboard_widgets` com RLS
2. **Tipos TypeScript** - Definir interfaces em `src/types/views.ts`
3. **Hook useViews** - Implementar CRUD de views
4. **ViewSelector** - Componente de selecao
5. **SaveViewDialog** - Componente de salvamento
6. **Integracao OKRsSection** - Filtros persistentes
7. **ViewManager** - Gerenciamento completo
8. **DashboardBuilder** - Editor visual (fase 2)
9. **Widgets Dinamicos** - Renderizacao configuravel (fase 2)

---

## Consideracoes de Seguranca

- Views sao vinculadas a `user_id` via RLS
- Compartilhamento validado no backend
- Apenas admins/gestores podem criar views publicas
- Widgets herdam permissoes da view pai
