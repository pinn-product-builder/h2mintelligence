
# Plano: Data Hub Avançado com Upload, Mapeamento e Logs

## Resumo
Criar um sistema completo de gerenciamento de dados (Data Hub) com upload de arquivos CSV/XLSX, validação robusta, visualização prévia, mapeamento inteligente de campos, logs detalhados de importação, tratamento de erros amigável e controle de acesso baseado em roles.

---

## O que será implementado

### 1. Upload de Arquivos com Validação Avançada
- Suporte a CSV e XLSX com validação de estrutura
- Limite de tamanho configurável (padrão 10MB)
- Validação de colunas obrigatórias
- Detecção automática de encoding (UTF-8, ISO-8859-1)
- Detecção de separador CSV (vírgula, ponto-e-vírgula, tab)
- Feedback visual durante upload

### 2. Visualização Prévia Aprimorada
- Tabela paginada com preview dos dados
- Detecção automática de tipos de dados (texto, número, moeda, data)
- Indicadores visuais de tipos por coluna
- Estatísticas do arquivo (linhas, colunas, valores nulos)
- Validação de dados com alertas visuais

### 3. Mapeamento de Campos
- Interface drag-and-drop para associar colunas
- Sugestão automática baseada em nomes de colunas
- Validação de tipos compatíveis
- Transformações disponíveis (SUM, AVG, COUNT, etc.)
- Preview do resultado do mapeamento

### 4. Logs Detalhados de Importação
- Histórico completo de operações
- Detalhes por importação (registros processados, ignorados, erros)
- Filtros por data, status, usuário
- Exportação de logs
- Timeline visual de operações

### 5. Tratamento de Erros e Feedback
- Mensagens de erro claras e acionáveis
- Validação em tempo real
- Rollback em caso de falha
- Notificações toast para operações
- Estados de loading amigáveis

### 6. Controle de Acesso por Role
- Verificação de permissões no acesso à seção Data Hub
- Roles: Admin (acesso total), Analista (importação), Visualizador (somente leitura)
- Feedback visual para usuários sem permissão
- Auditoria de ações por usuário

---

## Arquivos a serem modificados/criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/types/dataHub.ts` | Criar | Tipos para importação, logs e mapeamento |
| `src/hooks/useDataImport.ts` | Criar | Hook para gerenciar importação com validação |
| `src/hooks/useImportLogs.ts` | Criar | Hook para gerenciar logs de importação |
| `src/components/data/AdvancedFileUpload.tsx` | Criar | Upload com validação e progresso |
| `src/components/data/DataPreviewEnhanced.tsx` | Criar | Preview com estatísticas e validação |
| `src/components/data/ColumnMapper.tsx` | Criar | Interface de mapeamento de campos |
| `src/components/data/ImportLogViewer.tsx` | Criar | Visualização detalhada de logs |
| `src/components/data/ImportWizard.tsx` | Criar | Wizard de importação passo-a-passo |
| `src/components/sections/DataSourceSection.tsx` | Modificar | Integrar novos componentes e validação de role |
| `src/contexts/AppContext.tsx` | Modificar | Adicionar logs detalhados e validação |

---

## Detalhes Técnicos

### Novos Tipos (dataHub.ts)
```text
ImportLog {
  id: string
  sourceFile: string
  importType: 'csv' | 'xlsx' | 'manual'
  status: 'pending' | 'processing' | 'success' | 'partial' | 'error'
  startedAt: string
  completedAt?: string
  userId: string
  userName: string
  totalRows: number
  processedRows: number
  skippedRows: number
  errorRows: number
  errors: ImportError[]
  mapping?: FieldMapping
  targetTable: string
}

ImportError {
  row: number
  column?: string
  message: string
  severity: 'warning' | 'error'
  value?: string
}

FieldMapping {
  sourceColumn: string
  targetField: string
  transformation?: 'none' | 'sum' | 'avg' | 'count' | 'date_format'
  isRequired: boolean
}

ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  statistics: DataStatistics
}

DataStatistics {
  totalRows: number
  totalColumns: number
  nullValues: number
  uniqueValues: Record<string, number>
  columnTypes: Record<string, 'text' | 'number' | 'date' | 'currency'>
}
```

### Hook useDataImport
```text
useDataImport {
  // Estado
  file: File | null
  parseResult: ParseResult | null
  validation: ValidationResult | null
  mapping: FieldMapping[]
  isLoading: boolean
  step: 'upload' | 'preview' | 'mapping' | 'confirm' | 'complete'
  
  // Ações
  uploadFile(file: File): Promise<void>
  validateData(): ValidationResult
  setMapping(mapping: FieldMapping[]): void
  confirmImport(): Promise<ImportLog>
  reset(): void
  
  // Utilitários
  detectColumnTypes(): Record<string, string>
  suggestMappings(): FieldMapping[]
  previewTransformation(mapping: FieldMapping): DataRow[]
}
```

### Interface ImportWizard
```text
Passo 1 - Upload:
┌────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────┐   │
│ │                                                  │   │
│ │     📄 Arraste um arquivo CSV ou Excel aqui     │   │
│ │            ou clique para selecionar            │   │
│ │                                                  │   │
│ │         Formatos: .csv, .xlsx (max 10MB)        │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ Validações aplicadas:                                  │
│ ✓ Estrutura do arquivo                                │
│ ✓ Encoding (UTF-8 ou ISO-8859-1)                      │
│ ✓ Limite de tamanho                                   │
└────────────────────────────────────────────────────────┘

Passo 2 - Preview:
┌────────────────────────────────────────────────────────┐
│ Estatísticas do Arquivo                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ 1.250    │ │ 8        │ │ 12       │ │ 2        │   │
│ │ Linhas   │ │ Colunas  │ │ Nulos    │ │ Avisos   │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                        │
│ Preview dos Dados (primeiras 20 linhas)                │
│ ┌────────────────────────────────────────────────────┐ │
│ │ # │ Mês     │ Valor   │ Meta    │ Região │ Status │ │
│ │ 1 │ Jan/26  │ R$245K  │ R$250K  │ Sul    │ Ativo  │ │
│ │ 2 │ Jan/26  │ R$380K  │ R$350K  │ Sudeste│ Ativo  │ │
│ │...│ ...     │ ...     │ ...     │ ...    │ ...    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ⚠ 2 avisos encontrados                  [Ver Detalhes]│
└────────────────────────────────────────────────────────┘

Passo 3 - Mapeamento:
┌────────────────────────────────────────────────────────┐
│ Mapeamento de Campos                    [Auto-Mapear]  │
│                                                        │
│ Coluna do Arquivo    →    Campo do Sistema             │
│ ┌────────────────┐       ┌────────────────┐            │
│ │ Valor          │   →   │ Faturamento    │   [SUM]    │
│ └────────────────┘       └────────────────┘            │
│ ┌────────────────┐       ┌────────────────┐            │
│ │ Meta           │   →   │ Meta Vendas    │   [AVG]    │
│ └────────────────┘       └────────────────┘            │
│ ┌────────────────┐       ┌────────────────┐            │
│ │ Região         │   →   │ Centro Custo   │   [NONE]   │
│ └────────────────┘       └────────────────┘            │
│                                                        │
│ Campos obrigatórios:                                   │
│ ✓ Valor  ✓ Meta  ✗ Data (não mapeado)                 │
└────────────────────────────────────────────────────────┘

Passo 4 - Confirmação:
┌────────────────────────────────────────────────────────┐
│ Resumo da Importação                                   │
│                                                        │
│ Arquivo: vendas_jan_2026.xlsx                          │
│ Tabela destino: Faturamento Mensal                     │
│ Registros a importar: 1.248                            │
│ Campos mapeados: 6 de 8                                │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │ ⚠ Esta ação irá substituir dados existentes     │   │
│ │   do período Janeiro 2026.                       │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│                    [Cancelar]  [Confirmar Importação]  │
└────────────────────────────────────────────────────────┘
```

### Componente ImportLogViewer
```text
┌────────────────────────────────────────────────────────┐
│ Logs de Importação                                     │
├────────────────────────────────────────────────────────┤
│ Filtros: [Todos ▼] [Últimos 7 dias ▼] [Buscar...]     │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ● 29/01/2026 10:30 - vendas_jan.xlsx                  │
│   ✓ Sucesso | 1.250 registros | Carlos Silva          │
│   └─ [Expandir detalhes]                              │
│                                                        │
│ ● 28/01/2026 14:15 - custos_operacionais.csv          │
│   ⚠ Parcial | 890 de 920 registros | Ana Costa        │
│   └─ 30 linhas ignoradas (dados inválidos)            │
│      └─ Linha 45: Campo "valor" vazio                 │
│      └─ Linha 67: Data inválida "31/02/2026"          │
│      └─ [Ver todos os erros]                          │
│                                                        │
│ ● 27/01/2026 09:00 - estoque.xlsx                     │
│   ✗ Erro | 0 registros | Pedro Santos                 │
│   └─ Arquivo corrompido ou formato inválido           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Validação de Roles
```text
Função checkDataHubAccess(userRole):
  switch(userRole):
    case 'admin':
      return { canView: true, canImport: true, canDelete: true, canExport: true }
    case 'gestor':
      return { canView: true, canImport: true, canDelete: false, canExport: true }
    case 'analista':
      return { canView: true, canImport: true, canDelete: false, canExport: true }
    case 'visualizador':
      return { canView: true, canImport: false, canDelete: false, canExport: false }
    default:
      return { canView: false, canImport: false, canDelete: false, canExport: false }

Na seção DataSourceSection:
  const { user } = useAuth()
  const permissions = checkDataHubAccess(user?.role)
  
  if (!permissions.canView) {
    return <AccessDeniedMessage />
  }
  
  // Desabilitar botões baseado em permissões
  <Button disabled={!permissions.canImport}>Nova Importação</Button>
```

### Validações de Arquivo
```text
validateFile(file):
  errors = []
  
  // Validar extensão
  extension = file.name.split('.').pop().toLowerCase()
  if (!['csv', 'xlsx', 'xls'].includes(extension)):
    errors.push({ type: 'extension', message: 'Formato não suportado' })
  
  // Validar tamanho
  if (file.size > MAX_SIZE_MB * 1024 * 1024):
    errors.push({ type: 'size', message: 'Arquivo excede limite de XMB' })
  
  // Validar estrutura (após parse)
  if (columns.length === 0):
    errors.push({ type: 'structure', message: 'Nenhuma coluna detectada' })
  
  if (data.length === 0):
    errors.push({ type: 'empty', message: 'Arquivo vazio' })
  
  return { isValid: errors.length === 0, errors }

validateData(data, mapping):
  warnings = []
  errors = []
  
  for each row in data:
    // Verificar campos obrigatórios
    for each requiredField in mapping.filter(m => m.isRequired):
      if (row[requiredField.sourceColumn] === null || empty):
        errors.push({ row: index, column: requiredField, message: 'Campo obrigatório vazio' })
    
    // Validar tipos
    for each field in mapping:
      value = row[field.sourceColumn]
      if (field.expectedType === 'number' && !isNumeric(value)):
        warnings.push({ row: index, column: field, message: 'Valor não numérico' })
      if (field.expectedType === 'date' && !isValidDate(value)):
        warnings.push({ row: index, column: field, message: 'Data inválida' })
  
  return { errors, warnings }
```

---

## Fluxo de Implementação

1. **Criar tipos** (dataHub.ts): Definir interfaces para logs, mapeamento e validação
2. **Criar hooks** (useDataImport.ts, useImportLogs.ts): Lógica de importação e logs
3. **Criar AdvancedFileUpload**: Upload com validação e feedback visual
4. **Criar DataPreviewEnhanced**: Preview com estatísticas e alertas
5. **Criar ColumnMapper**: Interface de mapeamento drag-and-drop
6. **Criar ImportLogViewer**: Visualização detalhada de histórico
7. **Criar ImportWizard**: Combinar componentes em wizard passo-a-passo
8. **Atualizar DataSourceSection**: Integrar wizard e validação de roles
9. **Atualizar AppContext**: Adicionar estado de logs detalhados

---

## Resultado Esperado

- Upload intuitivo com validação em tempo real e feedback visual
- Preview rico com estatísticas, tipos detectados e alertas de problemas
- Mapeamento flexível com sugestões automáticas e transformações
- Logs completos com detalhes de erros e histórico de operações
- Tratamento de erros amigável com mensagens claras e acionáveis
- Controle de acesso por role impedindo ações não autorizadas
- Experiência consistente seguindo o design system existente
