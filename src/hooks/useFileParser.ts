import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

type DataRow = Record<string, string | number>;

interface ParseResult {
  data: DataRow[];
  columns: string[];
  error: string | null;
}

// Simple CSV parser
function parseCSV(content: string): { data: DataRow[]; columns: string[] } {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return { data: [], columns: [] };
  
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
      const num = parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''));
      row[col] = !isNaN(num) && value.match(/^[\d.,\-\s]+$/) ? num : value;
    });
    return row;
  }).filter(row => Object.values(row).some(v => v !== '' && v !== null));
  
  return { data, columns };
}

// Parse Excel files using SheetJS
function parseExcel(buffer: ArrayBuffer): { data: DataRow[]; columns: string[] } {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { data: [], columns: [] };

  const sheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (jsonData.length === 0) return { data: [], columns: [] };

  const columns = Object.keys(jsonData[0]);
  const data: DataRow[] = jsonData.map(row => {
    const typedRow: DataRow = {};
    for (const col of columns) {
      const val = row[col];
      if (val instanceof Date) {
        typedRow[col] = val.toISOString().split('T')[0];
      } else if (typeof val === 'number') {
        typedRow[col] = val;
      } else {
        typedRow[col] = String(val ?? '');
      }
    }
    return typedRow;
  }).filter(row => Object.values(row).some(v => v !== '' && v !== null));

  return { data, columns };
}

export function useFileParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  const parseFile = useCallback(async (file: File): Promise<ParseResult> => {
    setIsLoading(true);
    
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        const content = await file.text();
        const { data, columns } = parseCSV(content);
        const result = { data, columns, error: null };
        setParseResult(result);
        setIsLoading(false);
        return result;
      } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        const { data, columns } = parseExcel(buffer);
        const result = { data, columns, error: null };
        setParseResult(result);
        setIsLoading(false);
        return result;
      } else {
        const result: ParseResult = { data: [], columns: [], error: 'Formato não suportado' };
        setParseResult(result);
        setIsLoading(false);
        return result;
      }
    } catch (err) {
      console.error('File parse error:', err);
      const result: ParseResult = { data: [], columns: [], error: 'Erro ao processar arquivo' };
      setParseResult(result);
      setIsLoading(false);
      return result;
    }
  }, []);

  const clearResult = useCallback(() => {
    setParseResult(null);
  }, []);

  return {
    parseFile,
    clearResult,
    parseResult,
    isLoading
  };
}
