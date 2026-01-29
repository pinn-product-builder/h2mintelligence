import { useState, useCallback } from 'react';
import { ImportLog, ImportStatus } from '@/types/dataHub';

// Initial mock logs
const initialLogs: ImportLog[] = [
  {
    id: 'log-1',
    sourceFile: 'vendas_jan_2026.xlsx',
    importType: 'xlsx',
    status: 'success',
    startedAt: '2026-01-29T10:30:00',
    completedAt: '2026-01-29T10:30:45',
    userId: 'user-1',
    userName: 'Carlos Silva',
    totalRows: 1250,
    processedRows: 1250,
    skippedRows: 0,
    errorRows: 0,
    errors: [],
    targetTable: 'Faturamento Mensal',
  },
  {
    id: 'log-2',
    sourceFile: 'custos_operacionais.csv',
    importType: 'csv',
    status: 'partial',
    startedAt: '2026-01-28T14:15:00',
    completedAt: '2026-01-28T14:16:30',
    userId: 'user-2',
    userName: 'Ana Costa',
    totalRows: 920,
    processedRows: 890,
    skippedRows: 30,
    errorRows: 30,
    errors: [
      { row: 45, column: 'valor', message: 'Campo "valor" vazio', severity: 'error' },
      { row: 67, column: 'data', message: 'Data inválida "31/02/2026"', severity: 'error' },
      { row: 103, column: 'valor', message: 'Valor não numérico', severity: 'warning' },
    ],
    targetTable: 'Custos Operacionais',
  },
  {
    id: 'log-3',
    sourceFile: 'estoque_corrupto.xlsx',
    importType: 'xlsx',
    status: 'error',
    startedAt: '2026-01-27T09:00:00',
    completedAt: '2026-01-27T09:00:15',
    userId: 'user-3',
    userName: 'Pedro Santos',
    totalRows: 0,
    processedRows: 0,
    skippedRows: 0,
    errorRows: 0,
    errors: [
      { row: 0, message: 'Arquivo corrompido ou formato inválido', severity: 'error' },
    ],
    targetTable: 'Giro de Estoque',
  },
  {
    id: 'log-4',
    sourceFile: 'leads_marketing.csv',
    importType: 'csv',
    status: 'success',
    startedAt: '2026-01-26T16:45:00',
    completedAt: '2026-01-26T16:46:00',
    userId: 'user-7',
    userName: 'Bruno Martins',
    totalRows: 520,
    processedRows: 520,
    skippedRows: 0,
    errorRows: 0,
    errors: [],
    targetTable: 'Leads Marketing',
  },
];

export function useImportLogs() {
  const [logs, setLogs] = useState<ImportLog[]>(initialLogs);
  const [filter, setFilter] = useState<{
    status: ImportStatus | 'all';
    dateRange: 'all' | '7days' | '30days';
    search: string;
  }>({
    status: 'all',
    dateRange: 'all',
    search: '',
  });
  
  const addLog = useCallback((log: Omit<ImportLog, 'id'>) => {
    const newLog: ImportLog = {
      ...log,
      id: `log-${Date.now()}`,
    };
    setLogs(prev => [newLog, ...prev]);
    return newLog;
  }, []);
  
  const updateLog = useCallback((id: string, updates: Partial<ImportLog>) => {
    setLogs(prev => prev.map(log => 
      log.id === id ? { ...log, ...updates } : log
    ));
  }, []);
  
  const deleteLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  }, []);
  
  const filteredLogs = logs.filter(log => {
    // Status filter
    if (filter.status !== 'all' && log.status !== filter.status) {
      return false;
    }
    
    // Date range filter
    if (filter.dateRange !== 'all') {
      const logDate = new Date(log.startedAt);
      const now = new Date();
      const days = filter.dateRange === '7days' ? 7 : 30;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      if (logDate < cutoff) {
        return false;
      }
    }
    
    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        log.sourceFile.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.targetTable.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    partial: logs.filter(l => l.status === 'partial').length,
    error: logs.filter(l => l.status === 'error').length,
  };
  
  return {
    logs: filteredLogs,
    allLogs: logs,
    filter,
    setFilter,
    addLog,
    updateLog,
    deleteLog,
    stats,
  };
}
