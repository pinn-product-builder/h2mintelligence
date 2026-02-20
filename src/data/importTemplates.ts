import { FieldMapping } from '@/types/dataHub';

export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Financeiro' | 'Operações' | 'Marketing' | 'Geral';
  targetTable: string;
  /** Expected column names (case-insensitive match) */
  expectedColumns: string[];
  /** Pre-configured mappings keyed by expected column name → system field */
  mappings: Omit<FieldMapping, 'id'>[];
  /** Example file hint */
  exampleHint: string;
}

export const IMPORT_TEMPLATES: ImportTemplate[] = [
  // ── Financeiro ────────────────────────────────────────
  {
    id: 'faturamento-mensal',
    name: 'Faturamento Mensal',
    description: 'Receita por período com meta opcional. Colunas esperadas: data, valor, meta, setor.',
    category: 'Financeiro',
    targetTable: 'faturamento',
    expectedColumns: ['data', 'valor', 'meta', 'setor', 'periodo', 'regiao'],
    mappings: [
      { sourceColumn: 'data', targetField: 'data', transformation: 'none', isRequired: true, expectedType: 'date' },
      { sourceColumn: 'valor', targetField: 'valor', transformation: 'none', isRequired: true, expectedType: 'currency' },
      { sourceColumn: 'meta', targetField: 'meta', transformation: 'none', isRequired: false, expectedType: 'currency' },
      { sourceColumn: 'setor', targetField: 'setor', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'periodo', targetField: 'periodo', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'regiao', targetField: 'regiao', transformation: 'none', isRequired: false, expectedType: 'text' },
    ],
    exampleHint: 'data, valor, meta, setor',
  },
  {
    id: 'custos-operacionais',
    name: 'Custos Operacionais',
    description: 'Custos por categoria e período. Colunas esperadas: data, valor, descricao, setor.',
    category: 'Financeiro',
    targetTable: 'custos',
    expectedColumns: ['data', 'valor', 'descricao', 'setor', 'periodo'],
    mappings: [
      { sourceColumn: 'data', targetField: 'data', transformation: 'none', isRequired: true, expectedType: 'date' },
      { sourceColumn: 'valor', targetField: 'valor', transformation: 'none', isRequired: true, expectedType: 'currency' },
      { sourceColumn: 'descricao', targetField: 'descricao', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'setor', targetField: 'setor', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'periodo', targetField: 'periodo', transformation: 'none', isRequired: false, expectedType: 'text' },
    ],
    exampleHint: 'data, valor, descricao, setor',
  },
  {
    id: 'dre',
    name: 'DRE',
    description: 'Demonstrativo de Resultados. Colunas: data, valor, descricao, percentual.',
    category: 'Financeiro',
    targetTable: 'dre',
    expectedColumns: ['data', 'valor', 'descricao', 'percentual', 'periodo'],
    mappings: [
      { sourceColumn: 'data', targetField: 'data', transformation: 'none', isRequired: true, expectedType: 'date' },
      { sourceColumn: 'valor', targetField: 'valor', transformation: 'none', isRequired: true, expectedType: 'currency' },
      { sourceColumn: 'descricao', targetField: 'descricao', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'percentual', targetField: 'percentual', transformation: 'none', isRequired: false, expectedType: 'percentage' },
      { sourceColumn: 'periodo', targetField: 'periodo', transformation: 'none', isRequired: false, expectedType: 'text' },
    ],
    exampleHint: 'data, valor, descricao, percentual',
  },

  // ── Operações ─────────────────────────────────────────
  {
    id: 'giro-estoque',
    name: 'Giro de Estoque',
    description: 'Controle de estoque por item. Colunas: data, quantidade, valor, descricao, status.',
    category: 'Operações',
    targetTable: 'estoque',
    expectedColumns: ['data', 'quantidade', 'valor', 'descricao', 'status'],
    mappings: [
      { sourceColumn: 'data', targetField: 'data', transformation: 'none', isRequired: true, expectedType: 'date' },
      { sourceColumn: 'quantidade', targetField: 'quantidade', transformation: 'none', isRequired: false, expectedType: 'number' },
      { sourceColumn: 'valor', targetField: 'valor', transformation: 'none', isRequired: true, expectedType: 'currency' },
      { sourceColumn: 'descricao', targetField: 'descricao', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'status', targetField: 'status', transformation: 'none', isRequired: false, expectedType: 'text' },
    ],
    exampleHint: 'data, quantidade, valor, descricao',
  },
  {
    id: 'curva-abc',
    name: 'Curva ABC',
    description: 'Classificação ABC de produtos. Colunas: descricao, quantidade, valor, percentual.',
    category: 'Operações',
    targetTable: 'curva_abc',
    expectedColumns: ['descricao', 'quantidade', 'valor', 'percentual', 'data'],
    mappings: [
      { sourceColumn: 'data', targetField: 'data', transformation: 'none', isRequired: true, expectedType: 'date' },
      { sourceColumn: 'descricao', targetField: 'descricao', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'quantidade', targetField: 'quantidade', transformation: 'none', isRequired: false, expectedType: 'number' },
      { sourceColumn: 'valor', targetField: 'valor', transformation: 'none', isRequired: true, expectedType: 'currency' },
      { sourceColumn: 'percentual', targetField: 'percentual', transformation: 'none', isRequired: false, expectedType: 'percentage' },
    ],
    exampleHint: 'descricao, quantidade, valor, percentual',
  },

  // ── Marketing ─────────────────────────────────────────
  {
    id: 'leads-marketing',
    name: 'Leads Marketing',
    description: 'Leads e conversões por canal. Colunas: data, quantidade, valor, descricao, status.',
    category: 'Marketing',
    targetTable: 'leads',
    expectedColumns: ['data', 'quantidade', 'valor', 'descricao', 'status'],
    mappings: [
      { sourceColumn: 'data', targetField: 'data', transformation: 'none', isRequired: true, expectedType: 'date' },
      { sourceColumn: 'quantidade', targetField: 'quantidade', transformation: 'none', isRequired: false, expectedType: 'number' },
      { sourceColumn: 'valor', targetField: 'valor', transformation: 'none', isRequired: true, expectedType: 'currency' },
      { sourceColumn: 'descricao', targetField: 'descricao', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'status', targetField: 'status', transformation: 'none', isRequired: false, expectedType: 'text' },
    ],
    exampleHint: 'data, quantidade, valor, descricao',
  },
  {
    id: 'campanhas',
    name: 'Campanhas',
    description: 'Performance de campanhas. Colunas: data, valor, quantidade, percentual, descricao.',
    category: 'Marketing',
    targetTable: 'campanhas',
    expectedColumns: ['data', 'valor', 'quantidade', 'percentual', 'descricao'],
    mappings: [
      { sourceColumn: 'data', targetField: 'data', transformation: 'none', isRequired: true, expectedType: 'date' },
      { sourceColumn: 'valor', targetField: 'valor', transformation: 'none', isRequired: true, expectedType: 'currency' },
      { sourceColumn: 'quantidade', targetField: 'quantidade', transformation: 'none', isRequired: false, expectedType: 'number' },
      { sourceColumn: 'percentual', targetField: 'percentual', transformation: 'none', isRequired: false, expectedType: 'percentage' },
      { sourceColumn: 'descricao', targetField: 'descricao', transformation: 'none', isRequired: false, expectedType: 'text' },
    ],
    exampleHint: 'data, valor, quantidade, percentual',
  },

  // ── Geral ─────────────────────────────────────────────
  {
    id: 'metas-setor',
    name: 'Metas por Setor',
    description: 'Metas consolidadas por setor. Colunas: data, valor, meta, setor, percentual.',
    category: 'Geral',
    targetTable: 'metas',
    expectedColumns: ['data', 'valor', 'meta', 'setor', 'percentual'],
    mappings: [
      { sourceColumn: 'data', targetField: 'data', transformation: 'none', isRequired: true, expectedType: 'date' },
      { sourceColumn: 'valor', targetField: 'valor', transformation: 'none', isRequired: true, expectedType: 'currency' },
      { sourceColumn: 'meta', targetField: 'meta', transformation: 'none', isRequired: false, expectedType: 'currency' },
      { sourceColumn: 'setor', targetField: 'setor', transformation: 'none', isRequired: false, expectedType: 'text' },
      { sourceColumn: 'percentual', targetField: 'percentual', transformation: 'none', isRequired: false, expectedType: 'percentage' },
    ],
    exampleHint: 'data, valor, meta, setor',
  },
];

/**
 * Match file columns against templates and return the best match.
 * Uses case-insensitive fuzzy matching on column names.
 */
export function matchTemplate(
  fileColumns: string[],
  targetTable?: string
): { template: ImportTemplate; score: number; matchedColumns: string[] } | null {
  const normalizedFileColumns = fileColumns.map(c => c.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

  let bestMatch: { template: ImportTemplate; score: number; matchedColumns: string[] } | null = null;

  const candidates = targetTable
    ? IMPORT_TEMPLATES.filter(t => t.targetTable === targetTable)
    : IMPORT_TEMPLATES;

  for (const template of candidates) {
    const matchedColumns: string[] = [];
    for (const expected of template.expectedColumns) {
      const normalizedExpected = expected.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const match = normalizedFileColumns.find(c =>
        c === normalizedExpected ||
        c.includes(normalizedExpected) ||
        normalizedExpected.includes(c)
      );
      if (match) {
        const originalCol = fileColumns[normalizedFileColumns.indexOf(match)];
        matchedColumns.push(originalCol);
      }
    }

    const score = matchedColumns.length / template.expectedColumns.length;

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { template, score, matchedColumns };
    }
  }

  return bestMatch && bestMatch.score > 0 ? bestMatch : null;
}

/**
 * Apply a template's mappings to actual file columns.
 * Returns FieldMapping[] with matched source columns.
 */
export function applyTemplate(
  template: ImportTemplate,
  fileColumns: string[]
): FieldMapping[] {
  const normalizedFileColumns = fileColumns.map(c => c.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const result: FieldMapping[] = [];

  for (const mapping of template.mappings) {
    const normalizedSource = mapping.sourceColumn.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const matchIndex = normalizedFileColumns.findIndex(c =>
      c === normalizedSource ||
      c.includes(normalizedSource) ||
      normalizedSource.includes(c)
    );

    if (matchIndex !== -1) {
      result.push({
        ...mapping,
        id: `tpl-${Date.now()}-${result.length}`,
        sourceColumn: fileColumns[matchIndex], // Use original column name
      });
    }
  }

  return result;
}
