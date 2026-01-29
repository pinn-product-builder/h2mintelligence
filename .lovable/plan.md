
# Plano: Sistema de Tarefas em OKRs + Gestao Dinamica de Setores

## Resumo
Transformar o sistema de Sub-KRs em Tarefas, permitir criacao de tarefas internas com atribuicao de profissionais, implementar historico automatico para OKRs concluidos, remover abas de setores do menu lateral, e adicionar gestao de setores na tela de Configuracoes (restrita a admin).

---

## O que sera implementado

### 1. Renomear Sub-KRs para Tarefas
- Atualizar todos os textos e labels de "Sub-KR" para "Tarefa"
- Manter a mesma estrutura hierarquica dentro dos Key Results
- Ajustar badges, botoes e titulos nos componentes afetados

### 2. Criar Tarefas Internas em OKRs
- Adicionar formulario para criar tarefa dentro de cada KR
- Campo para selecionar profissional responsavel (lista de usuarios cadastrados)
- Campos: titulo, descricao, responsavel, prazo, prioridade
- Tarefas exibidas dentro do modal de detalhes do OKR

### 3. Historico/Delete Automatico de OKRs
- OKRs com progresso = 100% movidos automaticamente para historico
- Nova aba "Historico" na secao OKRs para consultar objetivos concluidos
- Botao manual para arquivar OKRs antes de 100%
- Possibilidade de restaurar OKRs do historico

### 4. Remover Abas/Telas de Setores
- Eliminar secao "Setores" do Sidebar (comercial, financeiro, compras, marketing, operacoes)
- Remover componente SectorSection.tsx das rotas
- Limpar references no Index.tsx e sectionTitles
- Setores continuam como atributo dos OKRs (para filtros)

### 5. Gestao de Setores em Configuracoes (Admin)
- Nova aba "Setores" dentro de ConfiguracoesSection
- CRUD para criar, editar e excluir setores
- Apenas usuarios com role "admin" podem acessar esta funcionalidade
- Setores dinamicos usados no formulario de criacao de OKR

---

## Arquivos a serem modificados/criados

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/types/okr.ts` | Modificar | Adicionar interface Task, tornar Sector dinamico |
| `src/contexts/AppContext.tsx` | Modificar | Adicionar estado/funcoes para tarefas, setores e historico OKRs |
| `src/components/layout/Sidebar.tsx` | Modificar | Remover secao "Setores" |
| `src/pages/Index.tsx` | Modificar | Remover rotas de setores |
| `src/components/okr/OKRDetailModal.tsx` | Modificar | Renomear Sub-KRs para Tarefas, adicionar formulario |
| `src/components/okr/SubKRList.tsx` | Renomear | Renomear para TaskList.tsx com textos atualizados |
| `src/components/okr/TaskForm.tsx` | Criar | Formulario para criar tarefas com selecao de profissional |
| `src/components/sections/ConfiguracoesSection.tsx` | Modificar | Adicionar aba "Setores" com CRUD (admin only) |
| `src/components/sections/OKRsSection.tsx` | Modificar | Adicionar aba/filtro de historico |
| `src/data/mockData.ts` | Modificar | Atualizar sectorLabels para ser dinamico |

---

## Detalhes Tecnicos

### Nova Interface Task
```text
Task {
  id: string
  title: string
  description?: string
  assignedTo: string (ID do usuario)
  assignedToName: string
  dueDate?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  completedAt?: string
  parentKRId: string (vinculo com Key Result)
}
```

### Tipo Sector Dinamico
```text
SectorConfig {
  id: string
  name: string
  slug: string (identificador unico)
  icon?: string
  color?: string
  createdAt: string
  createdBy: string
}

// Ao inves de tipo estatico, sectors virao do contexto
```

### Novas Funcoes no AppContext
```text
// Tarefas
tasks: Task[]
addTask(task): void
updateTask(id, data): void
deleteTask(id): void
completeTask(id): void

// Setores Dinamicos
sectors: SectorConfig[]
addSector(sector): void
updateSector(id, data): void
deleteSector(id): void

// Historico OKRs
archivedObjectives: Objective[]
archiveObjective(id): void
restoreObjective(id): void
autoArchiveCompleted(): void (executa ao atualizar progresso)
```

### Formulario de Tarefa (TaskForm.tsx)
```text
┌────────────────────────────────────────────────────────┐
│ Nova Tarefa                                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Titulo *                                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Ex: Preparar apresentacao para cliente          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Descricao                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Detalhes adicionais da tarefa...                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Responsavel *                                         │
│  ┌───────────────────────────────────────────┐        │
│  │ ▼ Selecionar profissional...              │        │
│  └───────────────────────────────────────────┘        │
│  Lista de usuarios cadastrados no sistema             │
│                                                        │
│  Prazo              Prioridade                         │
│  ┌─────────────┐    ┌─────────────┐                   │
│  │ 15/02/2026  │    │ ▼ Media     │                   │
│  └─────────────┘    └─────────────┘                   │
│                                                        │
│  [Cancelar]                     [Criar Tarefa]        │
└────────────────────────────────────────────────────────┘
```

### Aba Setores em Configuracoes (Admin Only)
```text
┌────────────────────────────────────────────────────────┐
│ [Geral] [Integracao] [Notificacoes] [Seguranca]       │
│ [Aparencia] [Setores]                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Gerenciamento de Setores              [+ Novo Setor]  │
│                                                        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Comercial                             [✏️] [🗑️] │   │
│ │ 4 OKRs vinculados                              │   │
│ └─────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Financeiro                            [✏️] [🗑️] │   │
│ │ 3 OKRs vinculados                              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                        │
│ ⚠️ Setores com OKRs vinculados nao podem ser         │
│    excluidos. Archive os OKRs primeiro.              │
└────────────────────────────────────────────────────────┘
```

### Visualizacao de Tarefas no OKRDetailModal
```text
┌────────────────────────────────────────────────────────┐
│ [Key Results] [Tarefas] [Historico]                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ TAREFAS (3)                        [+ Adicionar Tarefa]│
│                                                        │
│ ☑ Preparar relatorio mensal                           │
│   👤 Ana Costa · 📅 10/02/2026 · 🔴 Alta              │
│   Status: Concluida                                    │
│                                                        │
│ ☐ Contatar fornecedor principal                       │
│   👤 Pedro Santos · 📅 15/02/2026 · 🟡 Media          │
│   Status: Em progresso                                 │
│                                                        │
│ ☐ Revisar proposta comercial                          │
│   👤 Maria Lima · 📅 20/02/2026 · 🟢 Baixa            │
│   Status: Pendente                                     │
└────────────────────────────────────────────────────────┘
```

### Sidebar Atualizado (Sem Setores)
```text
PRINCIPAL
  Dashboard
  OKRs
  Indicadores
  Data Source

SISTEMA
  Usuarios
  Configuracoes

(Secao "Setores" removida completamente)
```

---

## Regras de Negocio

### Historico Automatico
```text
Quando objective.progress === 100:
  1. Exibir modal de confirmacao
  2. Se confirmado, mover para archivedObjectives
  3. OKR some da listagem ativa
  4. Acessivel via aba "Historico"
```

### Restricao Admin para Setores
```text
Na aba Setores de Configuracoes:
  - Verificar useAuth().user.role === 'admin'
  - Se nao for admin, ocultar aba ou mostrar mensagem
  - Apenas admin pode criar/editar/excluir setores
```

### Exclusao de Setores
```text
Ao tentar excluir setor:
  1. Verificar se existem OKRs vinculados
  2. Se count > 0: bloquear exclusao, exibir aviso
  3. Se count === 0: permitir exclusao
```

---

## Fluxo de Implementacao

1. **Atualizar tipos** (okr.ts): adicionar Task, SectorConfig
2. **Modificar AppContext**: estados e funcoes para tarefas, setores, historico
3. **Renomear SubKRList para TaskList**: atualizar textos
4. **Criar TaskForm**: formulario de criacao de tarefas
5. **Atualizar OKRDetailModal**: nova aba Tarefas, renomear labels
6. **Modificar Sidebar**: remover secao Setores
7. **Atualizar Index.tsx**: limpar rotas de setores
8. **Expandir ConfiguracoesSection**: nova aba Setores (admin)
9. **Adicionar historico em OKRsSection**: aba para OKRs arquivados
10. **Atualizar NewOKRForm**: usar setores dinamicos do contexto

---

## Resultado Esperado

- Tarefas podem ser criadas dentro de cada OKR/KR com responsavel atribuido
- Terminologia "Sub-KR" substituida por "Tarefas" em toda interface
- OKRs concluidos movidos automaticamente para historico
- Menu lateral simplificado sem abas individuais de setores
- Setores gerenciados dinamicamente em Configuracoes (apenas admin)
- Formulario de OKR usa lista dinamica de setores
