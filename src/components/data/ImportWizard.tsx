import { useState } from 'react';
import { useDataImport } from '@/hooks/useDataImport';
import { useImportLogs } from '@/hooks/useImportLogs';
import { useAuth } from '@/contexts/AuthContext';
import { TARGET_TABLES, WizardStep } from '@/types/dataHub';
import { AdvancedFileUpload } from './AdvancedFileUpload';
import { DataPreviewEnhanced } from './DataPreviewEnhanced';
import { ColumnMapper } from './ColumnMapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Eye, 
  GitBranch, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertTriangle,
  Sparkles,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

const steps: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  { id: 'upload', label: 'Upload', icon: <Upload className="w-4 h-4" /> },
  { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
  { id: 'mapping', label: 'Mapeamento', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'confirm', label: 'Confirmar', icon: <CheckCircle2 className="w-4 h-4" /> },
];

export function ImportWizard({ open, onOpenChange, onImportComplete }: ImportWizardProps) {
  const { user } = useAuth();
  const { 
    state, 
    isLoading, 
    setStep, 
    uploadFile, 
    setMappings, 
    setTargetTable, 
    validateImport,
    reset,
    canProceed 
  } = useDataImport();
  const { addLog } = useImportLogs();
  const [isConfirming, setIsConfirming] = useState(false);
  
  const currentStepIndex = steps.findIndex(s => s.id === state.step);
  
  const handleNext = () => {
    if (state.step === 'preview') {
      setStep('mapping');
    } else if (state.step === 'mapping') {
      validateImport();
      setStep('confirm');
    }
  };
  
  const handleBack = () => {
    if (state.step === 'preview') {
      reset();
    } else if (state.step === 'mapping') {
      setStep('preview');
    } else if (state.step === 'confirm') {
      setStep('mapping');
    }
  };
  
  const handleConfirmImport = async () => {
    setIsConfirming(true);
    
    const now = new Date();
    const hasErrors = state.validationResult?.errors.length || 0;
    
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // 1. Insert the imported data into the database
      const { error: metricsError } = await supabase
        .from('imported_metrics' as any)
        .insert({
          source_file: state.file?.name || 'Arquivo',
          target_table: state.targetTable,
          data: state.data,
          imported_by: authUser?.id,
          total_rows: state.data.length,
        } as any);
      
      if (metricsError) throw metricsError;
      
      // 2. Create the import log in the database
      const importErrors = (state.validationResult?.errors || [])
        .filter(e => e.row !== undefined)
        .slice(0, 20)
        .map(e => ({
          row: e.row!,
          column: e.column,
          message: e.message,
          severity: e.severity,
          value: e.value,
        }));
      
      const { error: logError } = await supabase
        .from('import_logs' as any)
        .insert({
          source_file: state.file?.name || 'Arquivo',
          import_type: state.file?.name.endsWith('.csv') ? 'csv' : 'xlsx',
          target_table: TARGET_TABLES.find(t => t.id === state.targetTable)?.label || state.targetTable,
          status: hasErrors > 0 ? 'partial' : 'success',
          started_at: now.toISOString(),
          completed_at: new Date().toISOString(),
          imported_by: authUser?.id,
          total_rows: state.data.length,
          processed_rows: state.data.length - (hasErrors > 0 ? Math.min(hasErrors, 10) : 0),
          skipped_rows: hasErrors > 0 ? Math.min(hasErrors, 10) : 0,
          error_rows: hasErrors,
          errors: importErrors,
          mappings: state.mappings,
        } as any);
      
      if (logError) throw logError;
      
      // Also add to local state for immediate UI update
      addLog({
        sourceFile: state.file?.name || 'Arquivo',
        importType: state.file?.name.endsWith('.csv') ? 'csv' : 'xlsx',
        status: hasErrors > 0 ? 'partial' : 'success',
        startedAt: now.toISOString(),
        completedAt: new Date().toISOString(),
        userId: authUser?.id || 'unknown',
        userName: user?.name || 'Usuário',
        totalRows: state.data.length,
        processedRows: state.data.length - (hasErrors > 0 ? Math.min(hasErrors, 10) : 0),
        skippedRows: hasErrors > 0 ? Math.min(hasErrors, 10) : 0,
        errorRows: hasErrors,
        errors: importErrors,
        targetTable: TARGET_TABLES.find(t => t.id === state.targetTable)?.label || state.targetTable,
      });
      
      toast({
        title: 'Importação concluída!',
        description: `${state.data.length} registros importados e salvos com sucesso.`,
      });
      
      setStep('complete');
      onImportComplete?.();
      
      // Close after a moment
      setTimeout(() => {
        reset();
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível salvar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };
  
  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Importar Dados
          </DialogTitle>
          <DialogDescription>
            Importe dados de arquivos CSV ou Excel para o sistema
          </DialogDescription>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between py-4 border-b">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
                index < currentStepIndex && "bg-success/10 text-success",
                index === currentStepIndex && "bg-primary/10 text-primary",
                index > currentStepIndex && "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  index < currentStepIndex && "bg-success text-success-foreground",
                  index === currentStepIndex && "bg-primary text-primary-foreground",
                  index > currentStepIndex && "bg-muted"
                )}>
                  {index < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>
                <span className="font-medium hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 sm:w-16 h-0.5 mx-2",
                  index < currentStepIndex ? "bg-success" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto py-4">
          {/* Step 1: Upload */}
          {state.step === 'upload' && (
            <div className="space-y-6">
              <AdvancedFileUpload
                onFileSelect={uploadFile}
                isLoading={isLoading}
                validation={state.validation}
              />
            </div>
          )}
          
          {/* Step 2: Preview */}
          {state.step === 'preview' && (
            <div className="space-y-6">
              <DataPreviewEnhanced
                data={state.data}
                columns={state.columns}
                statistics={state.statistics}
              />
            </div>
          )}
          
          {/* Step 3: Mapping */}
          {state.step === 'mapping' && (
            <div className="space-y-6">
              {/* Target Table Selection */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-base">Tabela de Destino</CardTitle>
                  <CardDescription>Selecione onde os dados serão importados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={state.targetTable} onValueChange={setTargetTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma tabela..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(
                        TARGET_TABLES.reduce((acc, table) => {
                          if (!acc[table.category]) acc[table.category] = [];
                          acc[table.category].push(table);
                          return acc;
                        }, {} as Record<string, typeof TARGET_TABLES[number][]>)
                      ).map(([category, tables]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {category}
                          </div>
                          {tables.map(table => (
                            <SelectItem key={table.id} value={table.id}>
                              {table.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Column Mapping */}
              <ColumnMapper
                sourceColumns={state.columns}
                columnTypes={state.statistics?.columnTypes || {}}
                mappings={state.mappings}
                onMappingsChange={setMappings}
              />
            </div>
          )}
          
          {/* Step 4: Confirm */}
          {state.step === 'confirm' && (
            <div className="space-y-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Resumo da Importação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Arquivo</p>
                      <p className="font-medium">{state.file?.name}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Tabela Destino</p>
                      <p className="font-medium">
                        {TARGET_TABLES.find(t => t.id === state.targetTable)?.label}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Registros</p>
                      <p className="font-medium">{state.data.length.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Campos Mapeados</p>
                      <p className="font-medium">{state.mappings.length} de {state.columns.length}</p>
                    </div>
                  </div>
                  
                  {/* Validation Results */}
                  {state.validationResult && (
                    <div className="space-y-3">
                      {state.validationResult.errors.length > 0 && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            {state.validationResult.errors.length} erro(s) encontrado(s)
                          </div>
                          <p className="text-sm text-destructive/80">
                            Registros com erros serão ignorados na importação.
                          </p>
                        </div>
                      )}
                      
                      {state.validationResult.warnings.length > 0 && (
                        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                          <div className="flex items-center gap-2 text-warning font-medium mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            {state.validationResult.warnings.length} aviso(s)
                          </div>
                          <p className="text-sm text-warning/80">
                            Alguns campos podem ter valores inconsistentes.
                          </p>
                        </div>
                      )}
                      
                      {state.validationResult.errors.length === 0 && state.validationResult.warnings.length === 0 && (
                        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                          <div className="flex items-center gap-2 text-success font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Todos os dados validados com sucesso!
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Step 5: Complete */}
          {state.step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Importação Concluída!</h3>
              <p className="text-muted-foreground mt-1">
                {state.data.length} registros importados com sucesso
              </p>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        {state.step !== 'complete' && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={state.step === 'upload' || isLoading || isConfirming}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              
              {state.step === 'confirm' ? (
                <Button 
                  onClick={handleConfirmImport}
                  disabled={isConfirming}
                  className="gradient-accent min-w-[150px]"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmar Importação
                    </>
                  )}
                </Button>
              ) : state.step !== 'upload' ? (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed || isLoading}
                  className="gradient-accent"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
