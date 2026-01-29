import { useState, useCallback } from 'react';

export interface DataRow {
  [key: string]: string | number;
}

export interface ParsedDocument {
  type: 'csv' | 'excel' | 'pdf' | 'docx';
  fileName: string;
  data: DataRow[];
  columns: string[];
  rawText?: string;
  recordCount: number;
}

// Simple CSV parser
function parseCSV(content: string): { data: DataRow[]; columns: string[] } {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return { data: [], columns: [] };
  
  // Detect separator (comma, semicolon, or tab)
  const firstLine = lines[0];
  let separator = ',';
  if (firstLine.includes(';') && !firstLine.includes(',')) separator = ';';
  else if (firstLine.includes('\t') && !firstLine.includes(',')) separator = '\t';
  
  const columns = lines[0].split(separator).map(col => col.trim().replace(/^"|"$/g, ''));
  
  const data: DataRow[] = lines.slice(1).map(line => {
    const values = line.split(separator).map(val => val.trim().replace(/^"|"$/g, ''));
    const row: DataRow = {};
    columns.forEach((col, index) => {
      const value = values[index] || '';
      // Try to parse as number
      const num = parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''));
      row[col] = !isNaN(num) && value.match(/^[\d.,\-\s]+$/) ? num : value;
    });
    return row;
  }).filter(row => Object.values(row).some(v => v !== '' && v !== null));
  
  return { data, columns };
}

// Generate mock data for Excel files
function generateExcelData(fileName: string): { data: DataRow[]; columns: string[] } {
  if (fileName.toLowerCase().includes('faturamento') || fileName.toLowerCase().includes('vendas')) {
    const columns = ['Mês', 'Região', 'Vendedor', 'Valor', 'Meta', 'Atingimento'];
    const data: DataRow[] = [
      { Mês: 'Jan/2026', Região: 'Sul', Vendedor: 'Carlos Silva', Valor: 245000, Meta: 250000, Atingimento: 98 },
      { Mês: 'Jan/2026', Região: 'Sudeste', Vendedor: 'Ana Costa', Valor: 380000, Meta: 350000, Atingimento: 108.5 },
      { Mês: 'Jan/2026', Região: 'Norte', Vendedor: 'Pedro Santos', Valor: 125000, Meta: 150000, Atingimento: 83.3 },
      { Mês: 'Jan/2026', Região: 'Nordeste', Vendedor: 'Maria Lima', Valor: 189000, Meta: 200000, Atingimento: 94.5 },
      { Mês: 'Jan/2026', Região: 'Centro-Oeste', Vendedor: 'Bruno Martins', Valor: 156000, Meta: 160000, Atingimento: 97.5 },
    ];
    return { data, columns };
  }
  
  if (fileName.toLowerCase().includes('meta') || fileName.toLowerCase().includes('okr')) {
    const columns = ['Objetivo', 'Key Result', 'Meta', 'Baseline', 'Unidade', 'Responsável'];
    const data: DataRow[] = [
      { Objetivo: 'Aumentar receita', 'Key Result': 'Faturamento mensal', Meta: 2500000, Baseline: 2000000, Unidade: 'R$', Responsável: 'Carlos Silva' },
      { Objetivo: 'Aumentar receita', 'Key Result': 'Ticket médio', Meta: 450, Baseline: 380, Unidade: 'R$', Responsável: 'Ana Costa' },
      { Objetivo: 'Melhorar satisfação', 'Key Result': 'NPS Score', Meta: 85, Baseline: 72, Unidade: 'pts', Responsável: 'Pedro Santos' },
      { Objetivo: 'Reduzir custos', 'Key Result': 'Custo operacional', Meta: 15, Baseline: 22, Unidade: '%', Responsável: 'Maria Lima' },
    ];
    return { data, columns };
  }
  
  // Default mock data
  const columns = ['ID', 'Descrição', 'Valor', 'Meta', 'Status'];
  const data: DataRow[] = [
    { ID: 1, Descrição: 'Indicador 1', Valor: 1500, Meta: 2000, Status: 'Em progresso' },
    { ID: 2, Descrição: 'Indicador 2', Valor: 2800, Meta: 2500, Status: 'Concluído' },
    { ID: 3, Descrição: 'Indicador 3', Valor: 950, Meta: 1200, Status: 'Em risco' },
    { ID: 4, Descrição: 'Indicador 4', Valor: 4200, Meta: 4000, Status: 'Concluído' },
  ];
  
  return { data, columns };
}

// Generate mock data for PDF files
function generatePDFData(fileName: string): { data: DataRow[]; columns: string[]; rawText: string } {
  const rawText = `Relatório de Metas - ${fileName}
  
Este documento contém as metas e indicadores para o período atual.

Resumo Executivo:
- Faturamento: R$ 2.5M (Meta: R$ 2.8M)
- Crescimento: 18% (Meta: 25%)
- NPS: 78 (Meta: 85)
- Clientes Ativos: 1.250 (Meta: 1.500)`;

  const columns = ['Indicador', 'Valor Atual', 'Meta', 'Unidade', 'Status'];
  const data: DataRow[] = [
    { Indicador: 'Faturamento', 'Valor Atual': 2500000, Meta: 2800000, Unidade: 'R$', Status: 'Em progresso' },
    { Indicador: 'Crescimento', 'Valor Atual': 18, Meta: 25, Unidade: '%', Status: 'Em risco' },
    { Indicador: 'NPS', 'Valor Atual': 78, Meta: 85, Unidade: 'pts', Status: 'Em progresso' },
    { Indicador: 'Clientes Ativos', 'Valor Atual': 1250, Meta: 1500, Unidade: 'un', Status: 'Em progresso' },
  ];
  
  return { data, columns, rawText };
}

// Generate mock data for DOCX files
function generateDOCXData(fileName: string): { data: DataRow[]; columns: string[]; rawText: string } {
  const rawText = `Documento de Planejamento - ${fileName}

Objetivos Estratégicos:

1. Expansão de Mercado
   - Meta: Aumentar market share em 15%
   - Prazo: Q2 2026
   - Responsável: Diretoria Comercial

2. Eficiência Operacional  
   - Meta: Reduzir custos em 20%
   - Prazo: Q4 2026
   - Responsável: Operações`;

  const columns = ['Objetivo', 'Meta', 'Prazo', 'Responsável', 'Área'];
  const data: DataRow[] = [
    { Objetivo: 'Expansão de Mercado', Meta: 15, Prazo: 'Q2 2026', Responsável: 'Carlos Silva', Área: 'Comercial' },
    { Objetivo: 'Eficiência Operacional', Meta: 20, Prazo: 'Q4 2026', Responsável: 'Ana Costa', Área: 'Operações' },
    { Objetivo: 'Satisfação do Cliente', Meta: 90, Prazo: 'Q3 2026', Responsável: 'Pedro Santos', Área: 'Atendimento' },
  ];
  
  return { data, columns, rawText };
}

export function useDocumentParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedDocument | null>(null);

  const parseDocument = useCallback(async (file: File): Promise<ParsedDocument> => {
    setIsLoading(true);
    setError(null);
    
    return new Promise((resolve, reject) => {
      // Simulate processing delay
      setTimeout(async () => {
        try {
          const extension = file.name.split('.').pop()?.toLowerCase();
          let parsedResult: ParsedDocument;
          
          if (extension === 'csv') {
            const content = await file.text();
            const { data, columns } = parseCSV(content);
            parsedResult = {
              type: 'csv',
              fileName: file.name,
              data,
              columns,
              recordCount: data.length,
            };
          } else if (extension === 'xlsx' || extension === 'xls') {
            const { data, columns } = generateExcelData(file.name);
            parsedResult = {
              type: 'excel',
              fileName: file.name,
              data,
              columns,
              recordCount: data.length,
            };
          } else if (extension === 'pdf') {
            const { data, columns, rawText } = generatePDFData(file.name);
            parsedResult = {
              type: 'pdf',
              fileName: file.name,
              data,
              columns,
              rawText,
              recordCount: data.length,
            };
          } else if (extension === 'docx' || extension === 'doc') {
            const { data, columns, rawText } = generateDOCXData(file.name);
            parsedResult = {
              type: 'docx',
              fileName: file.name,
              data,
              columns,
              rawText,
              recordCount: data.length,
            };
          } else {
            const errorMsg = 'Formato não suportado. Use CSV, Excel, PDF ou Word.';
            setError(errorMsg);
            setIsLoading(false);
            reject(new Error(errorMsg));
            return;
          }
          
          setResult(parsedResult);
          setIsLoading(false);
          resolve(parsedResult);
        } catch (err) {
          const errorMsg = 'Erro ao processar documento';
          setError(errorMsg);
          setIsLoading(false);
          reject(new Error(errorMsg));
        }
      }, 1000); // Simulate processing time
    });
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    parseDocument,
    clearResult,
    result,
    isLoading,
    error
  };
}
