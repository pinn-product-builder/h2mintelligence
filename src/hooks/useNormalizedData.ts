import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for view results
export interface FinanceiroResumo {
  ano: number;
  mes: number;
  trimestre: number;
  periodo_label: string;
  setor: string | null;
  regiao: string | null;
  tipo: string;
  subtipo: string | null;
  total_valor: number;
  total_meta: number | null;
  atingimento_pct: number | null;
  registros: number;
}

export interface OperacionalResumo {
  ano: number;
  mes: number;
  trimestre: number;
  periodo_label: string;
  setor: string | null;
  tipo: string;
  classificacao: string | null;
  total_quantidade: number | null;
  total_valor: number | null;
  avg_valor_unitario: number | null;
  registros: number;
}

export interface MarketingResumo {
  ano: number;
  mes: number;
  trimestre: number;
  periodo_label: string;
  canal: string | null;
  tipo: string;
  total_leads: number | null;
  total_conversoes: number | null;
  total_investimento: number | null;
  cpl: number | null;
  cac_calculado: number | null;
  avg_roi: number | null;
  registros: number;
}

/** Fetch financial summary from vw_financeiro_resumo */
export function useFinanceiroResumo(ano?: number) {
  return useQuery({
    queryKey: ['financeiro-resumo', ano],
    queryFn: async () => {
      let query = supabase
        .from('vw_financeiro_resumo' as any)
        .select('*')
        .order('ano', { ascending: true })
        .order('mes', { ascending: true });

      if (ano) {
        query = query.eq('ano', ano);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as FinanceiroResumo[];
    },
  });
}

/** Fetch operational summary from vw_operacional_resumo */
export function useOperacionalResumo(ano?: number) {
  return useQuery({
    queryKey: ['operacional-resumo', ano],
    queryFn: async () => {
      let query = supabase
        .from('vw_operacional_resumo' as any)
        .select('*')
        .order('ano', { ascending: true })
        .order('mes', { ascending: true });

      if (ano) {
        query = query.eq('ano', ano);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as OperacionalResumo[];
    },
  });
}

/** Fetch marketing summary from vw_marketing_resumo */
export function useMarketingResumo(ano?: number) {
  return useQuery({
    queryKey: ['marketing-resumo', ano],
    queryFn: async () => {
      let query = supabase
        .from('vw_marketing_resumo' as any)
        .select('*')
        .order('ano', { ascending: true })
        .order('mes', { ascending: true });

      if (ano) {
        query = query.eq('ano', ano);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as MarketingResumo[];
    },
  });
}

/** Aggregate KPI values from financial data */
export function useFinanceiroKPIs(ano?: number) {
  const { data: financeiro = [], isLoading } = useFinanceiroResumo(ano);

  const kpis = {
    faturamentoBruto: 0,
    custos: 0,
    ebitda: 0,
    margemEbitda: 0,
    faturamentoSeries: [] as { mes: string; valor: number }[],
    dreSummary: [] as { label: string; value: number; percent: string; highlight?: boolean }[],
  };

  if (financeiro.length === 0) return { kpis, isLoading, hasData: false };

  // Aggregate by tipo
  const faturamentoRows = financeiro.filter(r => r.tipo === 'faturamento');
  const custoRows = financeiro.filter(r => r.tipo === 'custo');
  const dreRows = financeiro.filter(r => r.tipo === 'dre_linha');

  kpis.faturamentoBruto = faturamentoRows.reduce((sum, r) => sum + r.total_valor, 0);
  kpis.custos = custoRows.reduce((sum, r) => sum + r.total_valor, 0);
  kpis.ebitda = kpis.faturamentoBruto - kpis.custos;
  kpis.margemEbitda = kpis.faturamentoBruto > 0
    ? (kpis.ebitda / kpis.faturamentoBruto) * 100
    : 0;

  // Monthly series for chart
  const monthlyMap = new Map<string, number>();
  faturamentoRows.forEach(r => {
    const key = r.periodo_label || `${r.mes}/${r.ano}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + r.total_valor);
  });
  kpis.faturamentoSeries = Array.from(monthlyMap.entries()).map(([mes, valor]) => ({
    mes,
    valor,
  }));

  // DRE summary
  const receitaBruta = kpis.faturamentoBruto;
  const deducoes = dreRows.filter(r => r.subtipo?.includes('dedu')).reduce((s, r) => s + r.total_valor, 0);
  const receitaLiquida = receitaBruta - deducoes;
  const cmv = dreRows.filter(r => r.subtipo?.includes('cmv')).reduce((s, r) => s + r.total_valor, 0);
  const lucroBruto = receitaLiquida - cmv;
  const despesasOp = dreRows.filter(r => r.subtipo?.includes('despesa')).reduce((s, r) => s + r.total_valor, 0);

  if (receitaBruta > 0) {
    kpis.dreSummary = [
      { label: 'Receita Bruta', value: receitaBruta, percent: '100%' },
      { label: '(-) Deduções', value: deducoes, percent: `${((deducoes / receitaBruta) * 100).toFixed(1)}%` },
      { label: 'Receita Líquida', value: receitaLiquida, percent: `${((receitaLiquida / receitaBruta) * 100).toFixed(1)}%` },
      { label: '(-) CMV', value: cmv, percent: `${((cmv / receitaBruta) * 100).toFixed(1)}%` },
      { label: 'Lucro Bruto', value: lucroBruto, percent: `${((lucroBruto / receitaBruta) * 100).toFixed(1)}%` },
      { label: '(-) Despesas Op.', value: despesasOp, percent: `${((despesasOp / receitaBruta) * 100).toFixed(1)}%` },
      { label: 'EBITDA', value: kpis.ebitda, percent: `${kpis.margemEbitda.toFixed(1)}%`, highlight: true },
    ];
  }

  return { kpis, isLoading, hasData: financeiro.length > 0 };
}
