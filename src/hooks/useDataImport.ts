import { useState, useCallback, useMemo } from 'react';
import { 
  ImportWizardState, 
  WizardStep, 
  FileValidation, 
  ValidationResult, 
  DataStatistics, 
  FieldMapping,
  ColumnDataType,
  SYSTEM_FIELDS
} from '@/types/dataHub';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = ['csv', 'xlsx', 'xls'];

// Detect column data type from sample values
function detectColumnType(values: (string | number | null)[]): ColumnDataType {
  const nonNullValues = values.filter(v => v !== null && v !== '');
  if (nonNullValues.length === 0) return 'text';
  
  const sample = nonNullValues.slice(0, 100);
  
  // Check for currency (R$, $, €)
  if (sample.some(v => typeof v === 'string' && /^R?\$\s*[\d.,]+/.test(v))) {
    return 'currency';
  }
  
  // Check for percentage
  if (sample.some(v => typeof v === 'string' && /[\d.,]+\s*%/.test(v))) {
    return 'percentage';
  }
  
  // Check for date patterns
  const datePatterns = [
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^[A-Za-z]{3}\/\d{2,4}$/,
  ];
  if (sample.every(v => typeof v === 'string' && datePatterns.some(p => p.test(v)))) {
    return 'date';
  }
  
  // Check for numbers
  if (sample.every(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v.replace(',', '.')))))) {
    return 'number';
  }
  
  // Check for boolean
  const boolValues = ['sim', 'não', 'yes', 'no', 'true', 'false', '1', '0', 'ativo', 'inativo'];
  if (sample.every(v => typeof v === 'string' && boolValues.includes(v.toLowerCase()))) {
    return 'boolean';
  }
  
  return 'text';
}

// Validate file before parsing
function validateFile(file: File): FileValidation {
  const errors: { type: string; message: string }[] = [];
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push({ 
      type: 'extension', 
      message: `Formato não suportado. Use: ${ALLOWED_EXTENSIONS.join(', ')}` 
    });
  }
  
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    errors.push({ 
      type: 'size', 
      message: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB` 
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      extension,
    }
  };
}

// Calculate statistics from data
function calculateStatistics(
  data: Record<string, unknown>[], 
  columns: string[]
): DataStatistics {
  const columnTypes: Record<string, ColumnDataType> = {};
  const uniqueValues: Record<string, number> = {};
  const sampleValues: Record<string, (string | number)[]> = {};
  let nullValues = 0;
  
  columns.forEach(col => {
    const values = data.map(row => row[col]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    nullValues += values.length - nonNullValues.length;
    uniqueValues[col] = new Set(nonNullValues.map(v => String(v))).size;
    columnTypes[col] = detectColumnType(values as (string | number | null)[]);
    sampleValues[col] = nonNullValues.slice(0, 5).map(v => 
      typeof v === 'number' ? v : String(v)
    );
  });
  
  return {
    totalRows: data.length,
    totalColumns: columns.length,
    nullValues,
    uniqueValues,
    columnTypes,
    sampleValues,
  };
}

// Suggest mappings based on column names
function suggestMappings(columns: string[], columnTypes: Record<string, ColumnDataType>): FieldMapping[] {
  const mappings: FieldMapping[] = [];
  
  const nameMatches: Record<string, string[]> = {
    valor: ['valor', 'value', 'faturamento', 'receita', 'total', 'montante', 'custo'],
    meta: ['meta', 'target', 'objetivo', 'goal'],
    data: ['data', 'date', 'dt', 'período', 'periodo', 'mês', 'mes'],
    setor: ['setor', 'sector', 'departamento', 'area', 'área'],
    regiao: ['região', 'regiao', 'region', 'estado', 'cidade'],
    quantidade: ['quantidade', 'qty', 'qtd', 'count', 'unidades'],
    percentual: ['percentual', 'percent', '%', 'taxa', 'rate'],
    status: ['status', 'situação', 'situacao', 'state'],
    descricao: ['descrição', 'descricao', 'description', 'obs', 'observação'],
  };
  
  columns.forEach(col => {
    const colLower = col.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let matchedField: string | null = null;
    
    for (const [fieldId, patterns] of Object.entries(nameMatches)) {
      if (patterns.some(p => colLower.includes(p))) {
        matchedField = fieldId;
        break;
      }
    }
    
    if (matchedField) {
      const systemField = SYSTEM_FIELDS.find(f => f.id === matchedField);
      if (systemField) {
        mappings.push({
          id: `map-${Date.now()}-${col}`,
          sourceColumn: col,
          targetField: systemField.id,
          transformation: 'none',
          isRequired: systemField.isRequired,
          expectedType: systemField.type,
        });
      }
    }
  });
  
  return mappings;
}

// Validate data against mappings
function validateData(
  data: Record<string, unknown>[], 
  mappings: FieldMapping[]
): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];
  
  const requiredMappings = mappings.filter(m => m.isRequired);
  const mappedRequiredFields = requiredMappings.map(m => m.targetField);
  const requiredSystemFields = SYSTEM_FIELDS.filter(f => f.isRequired);
  
  // Check if all required fields are mapped
  requiredSystemFields.forEach(field => {
    if (!mappedRequiredFields.includes(field.id)) {
      warnings.push({
        message: `Campo obrigatório "${field.label}" não foi mapeado`,
        severity: 'warning',
      });
    }
  });
  
  // Validate each row
  data.forEach((row, index) => {
    mappings.forEach(mapping => {
      const value = row[mapping.sourceColumn];
      
      // Check required fields
      if (mapping.isRequired && (value === null || value === undefined || value === '')) {
        errors.push({
          row: index + 1,
          column: mapping.sourceColumn,
          message: `Campo obrigatório "${mapping.sourceColumn}" está vazio`,
          severity: 'error',
          value: String(value ?? ''),
        });
      }
      
      // Type validation
      if (value !== null && value !== undefined && value !== '') {
        const strValue = String(value);
        
        if (mapping.expectedType === 'number' || mapping.expectedType === 'currency') {
          const num = parseFloat(strValue.replace(/[^\d.,-]/g, '').replace(',', '.'));
          if (isNaN(num)) {
            warnings.push({
              row: index + 1,
              column: mapping.sourceColumn,
              message: `Valor "${strValue}" não é numérico`,
              severity: 'warning',
              value: strValue,
            });
          }
        }
        
        if (mapping.expectedType === 'date') {
          const datePatterns = [
            /^\d{2}\/\d{2}\/\d{4}$/,
            /^\d{4}-\d{2}-\d{2}$/,
            /^\d{2}-\d{2}-\d{4}$/,
          ];
          if (!datePatterns.some(p => p.test(strValue))) {
            warnings.push({
              row: index + 1,
              column: mapping.sourceColumn,
              message: `Formato de data inválido: "${strValue}"`,
              severity: 'warning',
              value: strValue,
            });
          }
        }
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    statistics: { totalRows: data.length, totalColumns: 0, nullValues: 0, uniqueValues: {}, columnTypes: {}, sampleValues: {} },
  };
}

// Parse CSV content
function parseCSV(content: string): { data: Record<string, unknown>[]; columns: string[] } {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return { data: [], columns: [] };
  
  const firstLine = lines[0];
  let separator = ',';
  if (firstLine.includes(';') && !firstLine.includes(',')) separator = ';';
  else if (firstLine.includes('\t') && !firstLine.includes(',')) separator = '\t';
  
  const columns = lines[0].split(separator).map(col => col.trim().replace(/^"|"$/g, ''));
  
  const data: Record<string, unknown>[] = lines.slice(1).map(line => {
    const values = line.split(separator).map(val => val.trim().replace(/^"|"$/g, ''));
    const row: Record<string, unknown> = {};
    columns.forEach((col, index) => {
      const value = values[index] || '';
      const num = parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''));
      row[col] = !isNaN(num) && value.match(/^[\d.,\-\s]+$/) ? num : value;
    });
    return row;
  }).filter(row => Object.values(row).some(v => v !== '' && v !== null));
  
  return { data, columns };
}

// Generate mock Excel data
function generateMockExcelData(fileName: string): { data: Record<string, unknown>[]; columns: string[] } {
  if (fileName.toLowerCase().includes('faturamento') || fileName.toLowerCase().includes('vendas')) {
    const columns = ['Mês', 'Região', 'Vendedor', 'Valor', 'Meta', 'Atingimento'];
    const data = [
      { Mês: 'Jan/2026', Região: 'Sul', Vendedor: 'Carlos Silva', Valor: 245000, Meta: 250000, Atingimento: 98 },
      { Mês: 'Jan/2026', Região: 'Sudeste', Vendedor: 'Ana Costa', Valor: 380000, Meta: 350000, Atingimento: 108.5 },
      { Mês: 'Jan/2026', Região: 'Norte', Vendedor: 'Pedro Santos', Valor: 125000, Meta: 150000, Atingimento: 83.3 },
      { Mês: 'Jan/2026', Região: 'Nordeste', Vendedor: 'Maria Lima', Valor: 189000, Meta: 200000, Atingimento: 94.5 },
      { Mês: 'Fev/2026', Região: 'Sul', Vendedor: 'Carlos Silva', Valor: 268000, Meta: 260000, Atingimento: 103 },
      { Mês: 'Fev/2026', Região: 'Sudeste', Vendedor: 'Ana Costa', Valor: 412000, Meta: 380000, Atingimento: 108.4 },
    ];
    return { data, columns };
  }
  
  const columns = ['ID', 'Nome', 'Categoria', 'Valor', 'Data', 'Status'];
  const data = [
    { ID: 1, Nome: 'Item 1', Categoria: 'Categoria A', Valor: 1500, Data: '2026-01-15', Status: 'Ativo' },
    { ID: 2, Nome: 'Item 2', Categoria: 'Categoria B', Valor: 2800, Data: '2026-01-18', Status: 'Ativo' },
    { ID: 3, Nome: 'Item 3', Categoria: 'Categoria A', Valor: 950, Data: '2026-01-20', Status: 'Inativo' },
  ];
  
  return { data, columns };
}

const initialState: ImportWizardState = {
  step: 'upload',
  file: null,
  validation: null,
  data: [],
  columns: [],
  statistics: null,
  mappings: [],
  targetTable: '',
  validationResult: null,
};

export function useDataImport() {
  const [state, setState] = useState<ImportWizardState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  
  const setStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);
  
  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      setState(prev => ({ ...prev, file, validation, step: 'upload' }));
      setIsLoading(false);
      return;
    }
    
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let data: Record<string, unknown>[] = [];
      let columns: string[] = [];
      
      if (extension === 'csv') {
        const content = await file.text();
        const result = parseCSV(content);
        data = result.data;
        columns = result.columns;
      } else if (extension === 'xlsx' || extension === 'xls') {
        const result = generateMockExcelData(file.name);
        data = result.data;
        columns = result.columns;
      }
      
      const statistics = calculateStatistics(data, columns);
      const suggestedMappings = suggestMappings(columns, statistics.columnTypes);
      
      setState({
        step: 'preview',
        file,
        validation,
        data,
        columns,
        statistics,
        mappings: suggestedMappings,
        targetTable: '',
        validationResult: null,
      });
    } catch {
      setState(prev => ({
        ...prev,
        file,
        validation: {
          isValid: false,
          errors: [{ type: 'parse', message: 'Erro ao processar arquivo' }],
          fileInfo: validation.fileInfo,
        },
      }));
    }
    
    setIsLoading(false);
  }, []);
  
  const setMappings = useCallback((mappings: FieldMapping[]) => {
    setState(prev => ({ ...prev, mappings }));
  }, []);
  
  const setTargetTable = useCallback((targetTable: string) => {
    setState(prev => ({ ...prev, targetTable }));
  }, []);
  
  const validateImport = useCallback(() => {
    const result = validateData(state.data, state.mappings);
    result.statistics = state.statistics || result.statistics;
    setState(prev => ({ ...prev, validationResult: result }));
    return result;
  }, [state.data, state.mappings, state.statistics]);
  
  const reset = useCallback(() => {
    setState(initialState);
  }, []);
  
  const canProceed = useMemo(() => {
    switch (state.step) {
      case 'upload':
        return state.validation?.isValid && state.data.length > 0;
      case 'preview':
        return state.data.length > 0;
      case 'mapping':
        return state.mappings.length > 0 && state.targetTable !== '';
      case 'confirm':
        return state.validationResult?.isValid !== false;
      default:
        return false;
    }
  }, [state]);
  
  return {
    state,
    isLoading,
    setStep,
    uploadFile,
    setMappings,
    setTargetTable,
    validateImport,
    reset,
    canProceed,
  };
}
