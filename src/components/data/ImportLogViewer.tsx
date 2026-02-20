import { useState } from 'react';
import { ImportLog, ImportStatus } from '@/types/dataHub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Clock,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  User,
  Calendar,
  Download,
  Trash2,
  Undo2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImportLogViewerProps {
  logs: ImportLog[];
  filter: {
    status: ImportStatus | 'all';
    dateRange: 'all' | '7days' | '30days';
    search: string;
  };
  onFilterChange: (filter: ImportLogViewerProps['filter']) => void;
  onDeleteLog?: (id: string) => void;
  onRollback?: (id: string) => void;
  stats: {
    total: number;
    success: number;
    partial: number;
    error: number;
  };
}

const statusConfig: Record<ImportStatus, { icon: React.ReactNode; label: string; className: string }> = {
  pending: { 
    icon: <Clock className="w-4 h-4" />, 
    label: 'Pendente', 
    className: 'bg-muted text-muted-foreground' 
  },
  processing: { 
    icon: <Clock className="w-4 h-4 animate-spin" />, 
    label: 'Processando', 
    className: 'bg-primary/10 text-primary' 
  },
  success: { 
    icon: <CheckCircle2 className="w-4 h-4" />, 
    label: 'Sucesso', 
    className: 'bg-success/10 text-success' 
  },
  partial: { 
    icon: <AlertTriangle className="w-4 h-4" />, 
    label: 'Parcial', 
    className: 'bg-warning/10 text-warning' 
  },
  error: { 
    icon: <AlertCircle className="w-4 h-4" />, 
    label: 'Erro', 
    className: 'bg-destructive/10 text-destructive' 
  },
  rolled_back: {
    icon: <Undo2 className="w-4 h-4" />,
    label: 'Revertido',
    className: 'bg-muted text-muted-foreground',
  },
};

export function ImportLogViewer({
  logs,
  filter,
  onFilterChange,
  onDeleteLog,
  onRollback,
  stats,
}: ImportLogViewerProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  
  const toggleExpanded = (id: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const handleRollback = async (logId: string) => {
    setRollingBack(logId);
    try {
      const { data, error } = await supabase.rpc('rollback_import', {
        p_import_log_id: logId,
      } as any);

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: 'Importação revertida!',
          description: `${result.total_deleted} registro(s) removidos das tabelas de fatos.`,
        });
        onRollback?.(logId);
      } else {
        toast({
          title: 'Erro ao reverter',
          description: result?.error || 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Rollback error:', err);
      toast({
        title: 'Erro ao reverter',
        description: err.message || 'Não foi possível reverter a importação.',
        variant: 'destructive',
      });
    } finally {
      setRollingBack(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="card-elevated border-l-4 border-l-success">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.success}</p>
            <p className="text-sm text-muted-foreground">Sucesso</p>
          </CardContent>
        </Card>
        <Card className="card-elevated border-l-4 border-l-warning">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats.partial}</p>
            <p className="text-sm text-muted-foreground">Parcial</p>
          </CardContent>
        </Card>
        <Card className="card-elevated border-l-4 border-l-destructive">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.error}</p>
            <p className="text-sm text-muted-foreground">Erro</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select 
          value={filter.status} 
          onValueChange={(v) => onFilterChange({ ...filter, status: v as ImportStatus | 'all' })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filter.dateRange} 
          onValueChange={(v) => onFilterChange({ ...filter, dateRange: v as 'all' | '7days' | '30days' })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por arquivo, usuário..."
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Logs List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log de importação encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          logs.map(log => {
            const statusInfo = statusConfig[log.status];
            const isExpanded = expandedLogs.has(log.id);
            const hasErrors = log.errors.length > 0;
            
            return (
              <Collapsible 
                key={log.id} 
                open={isExpanded} 
                onOpenChange={() => toggleExpanded(log.id)}
              >
                <Card className={cn(
                  "card-elevated transition-all",
                  isExpanded && "ring-1 ring-primary/20"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        statusInfo.className
                      )}>
                        {statusInfo.icon}
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-foreground truncate">
                              {log.sourceFile}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(log.startedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {log.userName}
                              </span>
                              <Badge variant="outline">{log.targetTable}</Badge>
                            </div>
                          </div>
                          
                          <Badge className={statusInfo.className}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </Badge>
                        </div>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">{log.processedRows.toLocaleString('pt-BR')}</span>
                            {' '}de {log.totalRows.toLocaleString('pt-BR')} registros
                          </span>
                          {log.skippedRows > 0 && (
                            <span className="text-warning">
                              {log.skippedRows} ignorados
                            </span>
                          )}
                          {log.errorRows > 0 && (
                            <span className="text-destructive">
                              {log.errorRows} erros
                            </span>
                          )}
                        </div>
                        
                        {/* Expandable Error Details */}
                        {hasErrors && (
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="mt-2 gap-1 text-muted-foreground">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {/* Rollback button - only for success/partial imports */}
                        {(log.status === 'success' || log.status === 'partial') && onRollback && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-warning"
                                disabled={rollingBack === log.id}
                              >
                                {rollingBack === log.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Undo2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reverter Importação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso removerá <strong>todos os {log.processedRows} registros</strong> importados de "{log.sourceFile}" das tabelas de fatos. Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRollback(log.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Reverter Importação
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                        {onDeleteLog && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => onDeleteLog(log.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Error Details */}
                    <CollapsibleContent>
                      {hasErrors && (
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Erros encontrados ({log.errors.length})
                          </p>
                          {log.errors.slice(0, 10).map((error, i) => (
                            <div 
                              key={i}
                              className={cn(
                                "p-3 rounded-lg text-sm",
                                error.severity === 'error' 
                                  ? "bg-destructive/10 text-destructive" 
                                  : "bg-warning/10 text-warning"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                {error.severity === 'error' ? (
                                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p>
                                    {error.row > 0 && <span className="font-mono">Linha {error.row}: </span>}
                                    {error.message}
                                  </p>
                                  {error.value && (
                                    <p className="text-xs opacity-70 mt-1">
                                      Valor: "{error.value}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {log.errors.length > 10 && (
                            <p className="text-sm text-muted-foreground text-center pt-2">
                              e mais {log.errors.length - 10} erros...
                            </p>
                          )}
                        </div>
                      )}
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}
