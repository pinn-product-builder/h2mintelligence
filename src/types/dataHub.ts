// Data Hub Types - Import, Validation, Mapping and Logs

export type ImportStatus = 'pending' | 'processing' | 'success' | 'partial' | 'error' | 'rolled_back';
export type ImportType = 'csv' | 'xlsx' | 'manual';
export type TransformationType = 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max' | 'date_format';
export type ColumnDataType = 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
export type ErrorSeverity = 'warning' | 'error';

// Import Error
export interface ImportError {
  row: number;
  column?: string;
  message: string;
  severity: ErrorSeverity;
  value?: string;
}

// Field Mapping
export interface FieldMapping {
  id: string;
  sourceColumn: string;
  targetField: string;
  transformation: TransformationType;
  isRequired: boolean;
  expectedType?: ColumnDataType;
}

// Import Log
export interface ImportLog {
  id: string;
  sourceFile: string;
  importType: ImportType;
  status: ImportStatus;
  startedAt: string;
  completedAt?: string;
  userId: string;
  userName: string;
  totalRows: number;
  processedRows: number;
  skippedRows: number;
  errorRows: number;
  errors: ImportError[];
  mappings?: FieldMapping[];
  targetTable: string;
}

// Data Statistics
export interface DataStatistics {
  totalRows: number;
  totalColumns: number;
  nullValues: number;
  uniqueValues: Record<string, number>;
  columnTypes: Record<string, ColumnDataType>;
  sampleValues: Record<string, (string | number)[]>;
}

// Validation Error/Warning
export interface ValidationIssue {
  row?: number;
  column?: string;
  message: string;
  severity: ErrorSeverity;
  value?: string;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  statistics: DataStatistics;
}

// File Validation
export interface FileValidation {
  isValid: boolean;
  errors: { type: string; message: string }[];
  fileInfo: {
    name: string;
    size: number;
    extension: string;
    encoding?: string;
    separator?: string;
  };
}

// System Fields for Mapping
export interface SystemField {
  id: string;
  name: string;
  label: string;
  type: ColumnDataType;
  isRequired: boolean;
  category: string;
}

// Data Hub Permissions
export interface DataHubPermissions {
  canView: boolean;
  canImport: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageMappings: boolean;
}

// Wizard Step
export type WizardStep = 'upload' | 'preview' | 'mapping' | 'confirm' | 'complete';

// Import Wizard State
export interface ImportWizardState {
  step: WizardStep;
  file: File | null;
  validation: FileValidation | null;
  data: Record<string, unknown>[];
  columns: string[];
  statistics: DataStatistics | null;
  mappings: FieldMapping[];
  targetTable: string;
  validationResult: ValidationResult | null;
}

// Target tables for import
export const TARGET_TABLES = [
  { id: 'faturamento', label: 'Faturamento Mensal', category: 'Financeiro' },
  { id: 'custos', label: 'Custos Operacionais', category: 'Financeiro' },
  { id: 'dre', label: 'DRE', category: 'Financeiro' },
  { id: 'estoque', label: 'Giro de Estoque', category: 'Operações' },
  { id: 'curva_abc', label: 'Curva ABC', category: 'Operações' },
  { id: 'leads', label: 'Leads Marketing', category: 'Marketing' },
  { id: 'campanhas', label: 'Campanhas', category: 'Marketing' },
  { id: 'metas', label: 'Metas por Setor', category: 'Geral' },
] as const;

// System fields available for mapping
export const SYSTEM_FIELDS: SystemField[] = [
  { id: 'valor', name: 'valor', label: 'Valor', type: 'currency', isRequired: true, category: 'Financeiro' },
  { id: 'meta', name: 'meta', label: 'Meta', type: 'currency', isRequired: false, category: 'Financeiro' },
  { id: 'data', name: 'data', label: 'Data', type: 'date', isRequired: true, category: 'Geral' },
  { id: 'periodo', name: 'periodo', label: 'Período', type: 'text', isRequired: false, category: 'Geral' },
  { id: 'setor', name: 'setor', label: 'Setor', type: 'text', isRequired: false, category: 'Geral' },
  { id: 'regiao', name: 'regiao', label: 'Região', type: 'text', isRequired: false, category: 'Geral' },
  { id: 'quantidade', name: 'quantidade', label: 'Quantidade', type: 'number', isRequired: false, category: 'Operações' },
  { id: 'percentual', name: 'percentual', label: 'Percentual', type: 'percentage', isRequired: false, category: 'Geral' },
  { id: 'status', name: 'status', label: 'Status', type: 'text', isRequired: false, category: 'Geral' },
  { id: 'descricao', name: 'descricao', label: 'Descrição', type: 'text', isRequired: false, category: 'Geral' },
];

// Transformation types for mapping
export const TRANSFORMATION_TYPES = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'sum', label: 'SUM' },
  { value: 'avg', label: 'AVG' },
  { value: 'count', label: 'COUNT' },
  { value: 'min', label: 'MIN' },
  { value: 'max', label: 'MAX' },
  { value: 'date_format', label: 'Formato de Data' },
] as const;
