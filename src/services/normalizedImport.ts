import { supabase } from '@/integrations/supabase/client';

/**
 * Service for inserting imported data into normalized fact tables.
 * Resolves dimension references (periodo, regiao, setor) and routes
 * data to the correct fact table based on target category.
 */

export type FactCategory = 'financeiro' | 'operacional' | 'marketing';

export interface NormalizedImportConfig {
  targetTable: string;
  category: FactCategory;
  data: Record<string, unknown>[];
  mappings: { sourceColumn: string; targetField: string }[];
  fileName: string;
  importLogId?: string;
  userId?: string;
}

// Map target table IDs to fact categories
const TABLE_CATEGORY_MAP: Record<string, FactCategory> = {
  faturamento: 'financeiro',
  custos: 'financeiro',
  dre: 'financeiro',
  estoque: 'operacional',
  curva_abc: 'operacional',
  leads: 'marketing',
  campanhas: 'marketing',
  metas: 'financeiro',
};

// Map target table IDs to tipo values
const TABLE_TIPO_MAP: Record<string, string> = {
  faturamento: 'faturamento',
  custos: 'custo',
  dre: 'dre_linha',
  estoque: 'estoque',
  curva_abc: 'curva_abc',
  leads: 'lead',
  campanhas: 'campanha',
  metas: 'meta_setor',
};

/** Resolve or create a periodo dimension entry from date-like values */
async function resolvePeriodo(dateValue: unknown): Promise<string | null> {
  if (!dateValue) return null;

  let ano: number;
  let mes: number;

  const strVal = String(dateValue).trim();

  // Pattern: "Jan/2026", "Fev/2026"
  const monthYearMatch = strVal.match(/^([A-Za-zÀ-ú]{3,})\/(\d{4})$/);
  if (monthYearMatch) {
    const monthNames: Record<string, number> = {
      jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
      jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
    };
    mes = monthNames[monthYearMatch[1].toLowerCase().substring(0, 3)] || 1;
    ano = parseInt(monthYearMatch[2]);
  }
  // Pattern: "2026-01-15" or "15/01/2026"
  else if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) {
    ano = parseInt(strVal.substring(0, 4));
    mes = parseInt(strVal.substring(5, 7));
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(strVal)) {
    ano = parseInt(strVal.substring(6, 10));
    mes = parseInt(strVal.substring(3, 5));
  } else {
    return null;
  }

  // Look up existing
  const { data: existing } = await supabase
    .from('dim_periodo' as any)
    .select('id')
    .eq('ano', ano)
    .eq('mes', mes)
    .maybeSingle();

  if ((existing as any)?.id) return (existing as any).id;

  // Should exist from seed data, but return null if not found
  return null;
}

/** Resolve or create a regiao dimension entry */
async function resolveRegiao(regiaoValue: unknown): Promise<string | null> {
  if (!regiaoValue) return null;
  const nome = String(regiaoValue).trim();
  if (!nome) return null;

  const { data: existing } = await supabase
    .from('dim_regiao' as any)
    .select('id')
    .eq('nome', nome)
    .maybeSingle();

  if ((existing as any)?.id) return (existing as any).id;

  // Create new
  const { data: created } = await supabase
    .from('dim_regiao' as any)
    .insert({ nome } as any)
    .select('id')
    .single();

  return (created as any)?.id || null;
}

/** Resolve sector by name */
async function resolveSector(sectorValue: unknown): Promise<string | null> {
  if (!sectorValue) return null;
  const nome = String(sectorValue).trim();
  if (!nome) return null;

  const { data: existing } = await supabase
    .from('sectors')
    .select('id')
    .ilike('name', nome)
    .maybeSingle();

  return existing?.id || null;
}

/** Get mapped value from a row */
function getMappedValue(
  row: Record<string, unknown>,
  mappings: { sourceColumn: string; targetField: string }[],
  targetField: string
): unknown {
  const mapping = mappings.find(m => m.targetField === targetField);
  if (!mapping) return null;
  return row[mapping.sourceColumn] ?? null;
}

/** Parse numeric value from various formats */
function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const str = String(value).replace(/[R$€\s]/g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/** Insert data into normalized fact tables */
export async function insertNormalizedData(config: NormalizedImportConfig): Promise<{
  insertedRows: number;
  errors: string[];
}> {
  const category = TABLE_CATEGORY_MAP[config.targetTable];
  const tipo = TABLE_TIPO_MAP[config.targetTable] || config.targetTable;
  const errors: string[] = [];
  let insertedRows = 0;

  if (!category) {
    // Fallback: save to imported_metrics as before
    const { error } = await supabase
      .from('imported_metrics' as any)
      .insert({
        source_file: config.fileName,
        target_table: config.targetTable,
        data: config.data,
        imported_by: config.userId,
        total_rows: config.data.length,
      } as any);

    if (error) {
      errors.push(`Fallback insert error: ${error.message}`);
    } else {
      insertedRows = config.data.length;
    }
    return { insertedRows, errors };
  }

  // Process rows in batches
  const BATCH_SIZE = 50;

  for (let i = 0; i < config.data.length; i += BATCH_SIZE) {
    const batch = config.data.slice(i, i + BATCH_SIZE);
    
    if (category === 'financeiro') {
      const rows = [];
      for (const row of batch) {
        const dateVal = getMappedValue(row, config.mappings, 'data');
        const periodoId = await resolvePeriodo(dateVal);
        const regiaoVal = getMappedValue(row, config.mappings, 'regiao');
        const regiaoId = await resolveRegiao(regiaoVal);
        const setorVal = getMappedValue(row, config.mappings, 'setor');
        const sectorId = await resolveSector(setorVal);
        const valor = parseNumeric(getMappedValue(row, config.mappings, 'valor'));
        const meta = parseNumeric(getMappedValue(row, config.mappings, 'meta'));

        if (valor === null) {
          errors.push(`Linha ${i + batch.indexOf(row) + 1}: valor obrigatório ausente`);
          continue;
        }

        rows.push({
          periodo_id: periodoId,
          sector_id: sectorId,
          regiao_id: regiaoId,
          tipo,
          subtipo: getMappedValue(row, config.mappings, 'descricao') as string || null,
          valor,
          meta,
          fonte: config.fileName,
          import_log_id: config.importLogId || null,
          imported_by: config.userId || null,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from('fact_financeiro' as any)
          .insert(rows as any);
        if (error) {
          errors.push(`Batch financeiro error: ${error.message}`);
        } else {
          insertedRows += rows.length;
        }
      }
    } else if (category === 'operacional') {
      const rows = [];
      for (const row of batch) {
        const dateVal = getMappedValue(row, config.mappings, 'data');
        const periodoId = await resolvePeriodo(dateVal);
        const setorVal = getMappedValue(row, config.mappings, 'setor');
        const sectorId = await resolveSector(setorVal);
        const quantidade = parseNumeric(getMappedValue(row, config.mappings, 'quantidade'));
        const valorTotal = parseNumeric(getMappedValue(row, config.mappings, 'valor'));

        rows.push({
          periodo_id: periodoId,
          sector_id: sectorId,
          tipo,
          item: getMappedValue(row, config.mappings, 'descricao') as string || null,
          quantidade,
          valor_total: valorTotal,
          classificacao: getMappedValue(row, config.mappings, 'status') as string || null,
          fonte: config.fileName,
          import_log_id: config.importLogId || null,
          imported_by: config.userId || null,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from('fact_operacional' as any)
          .insert(rows as any);
        if (error) {
          errors.push(`Batch operacional error: ${error.message}`);
        } else {
          insertedRows += rows.length;
        }
      }
    } else if (category === 'marketing') {
      const rows = [];
      for (const row of batch) {
        const dateVal = getMappedValue(row, config.mappings, 'data');
        const periodoId = await resolvePeriodo(dateVal);
        const leadsVal = parseNumeric(getMappedValue(row, config.mappings, 'quantidade'));
        const investimento = parseNumeric(getMappedValue(row, config.mappings, 'valor'));

        rows.push({
          periodo_id: periodoId,
          canal: getMappedValue(row, config.mappings, 'setor') as string || null,
          tipo,
          nome_campanha: getMappedValue(row, config.mappings, 'descricao') as string || null,
          leads: leadsVal ? Math.round(leadsVal) : null,
          investimento,
          fonte: config.fileName,
          import_log_id: config.importLogId || null,
          imported_by: config.userId || null,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from('fact_marketing' as any)
          .insert(rows as any);
        if (error) {
          errors.push(`Batch marketing error: ${error.message}`);
        } else {
          insertedRows += rows.length;
        }
      }
    }
  }

  return { insertedRows, errors };
}
