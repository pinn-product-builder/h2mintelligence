
# Plano: Gestão Dinâmica de Ciclos de OKR

## Resumo
Transformar o seletor de ciclos de OKR (Q1 2026, Q2 2026, etc.) de abas fixas para um sistema dinâmico com operações CRUD, usando uma lista dropdown. Incluir lógica de exclusão/arquivamento baseada na existência de OKRs vinculados ao período.

---

## O que será implementado

### 1. Seletor de Período em Lista (Dropdown)
- Substituir as abas de ciclo por um componente `Select` (dropdown)
- Exibir indicador visual para o ciclo ativo atual
- Mostrar contador de OKRs vinculados a cada período

### 2. Gestão Dinâmica de Ciclos (CRUD)
- **Criar**: Formulário para adicionar novos períodos/ciclos
- **Editar**: Permitir renomear ciclos existentes
- **Excluir**: Apenas para ciclos SEM OKRs vinculados
- **Arquivar**: Ciclos COM OKRs vinculados vão para histórico

### 3. Sistema de Histórico
- Ciclos arquivados ficam separados em uma seção "Histórico"
- Rodapé informativo indicando onde encontrar os períodos arquivados
- Possibilidade de consultar OKRs de ciclos antigos

### 4. Regras de Negócio
- Período com 0 OKRs: pode ser **excluído** permanentemente
- Período com 1+ OKRs: só pode ser **arquivado** (movido para histórico)
- Confirmação de ação antes de excluir/arquivar

---

## Arquivos a serem modificados/criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/types/okr.ts` | Modificar | Adicionar interface `OKRCycle` |
| `src/contexts/AppContext.tsx` | Modificar | Adicionar estado e funções CRUD para ciclos |
| `src/components/sections/OKRsSection.tsx` | Modificar | Substituir abas por dropdown + botões de gestão |
| `src/components/okr/CycleManager.tsx` | Criar | Modal/dialog para gerenciar ciclos |
| `src/components/okr/NewOKRForm.tsx` | Modificar | Usar ciclos dinâmicos do contexto |

---

## Detalhes Técnicos

### Nova Interface `OKRCycle`
```text
OKRCycle {
  id: string
  label: string (ex: "Q1 2026")
  startDate: string
  endDate: string
  isActive: boolean
  isArchived: boolean
  createdAt: string
}
```

### Novas Funções no AppContext
```text
- cycles: OKRCycle[]
- archivedCycles: OKRCycle[]
- addCycle(cycle)
- updateCycle(id, data)
- deleteCycle(id) - só se não tiver OKRs
- archiveCycle(id) - move para histórico
- getOKRsByCycle(cycleId) - retorna OKRs do período
```

### Lógica de Exclusão vs Arquivamento
```text
ao tentar remover um ciclo:
  ├── contar OKRs com period === cycle.label
  ├── se count === 0: permitir EXCLUIR
  └── se count > 0: exibir opção de ARQUIVAR
```

### Interface do Seletor
```text
┌─────────────────────────────────────┐
│ [Dropdown: Q1 2026 ▼] [⚙️ Gerenciar]│
└─────────────────────────────────────┘

No dropdown:
- Q1 2026 (ativo) ● - 5 OKRs
- Q2 2026 - 0 OKRs
- Q3 2026 - 0 OKRs
```

### Rodapé Informativo (quando houver histórico)
```text
┌─────────────────────────────────────────────────┐
│ 📁 2 períodos arquivados. Ver em: Configurações │
│    > Histórico de Ciclos                        │
└─────────────────────────────────────────────────┘
```

---

## Fluxo de Implementação

1. **Criar tipos e estrutura de dados** para ciclos
2. **Atualizar AppContext** com estado e funções CRUD
3. **Criar CycleManager** para adicionar/editar/excluir ciclos
4. **Refatorar OKRsSection** para usar dropdown dinâmico
5. **Atualizar NewOKRForm** para listar ciclos do contexto
6. **Adicionar rodapé** com link para histórico
7. **Testes visuais** do fluxo completo

---

## Resultado Esperado

- Usuário seleciona períodos via dropdown (não mais abas)
- Pode criar novos ciclos (ex: "Q1 2027", "Anual 2026")
- Ciclos vazios podem ser excluídos
- Ciclos com OKRs são arquivados e acessíveis via histórico
- Rodapé informa sobre ciclos arquivados
