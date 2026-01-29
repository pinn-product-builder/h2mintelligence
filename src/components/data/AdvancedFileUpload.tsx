import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { FileSpreadsheet, FileUp, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileValidation } from '@/types/dataHub';

interface AdvancedFileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  validation?: FileValidation | null;
  accept?: string;
  maxSizeMB?: number;
}

export function AdvancedFileUpload({ 
  onFileSelect, 
  isLoading = false,
  validation,
  accept = '.csv,.xlsx,.xls',
  maxSizeMB = 10,
}: AdvancedFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileLocally = (file: File): boolean => {
    setLocalError(null);
    
    const validExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setLocalError(`Tipo de arquivo não suportado. Use: ${accept}`);
      return false;
    }
    
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return false;
    }
    
    return true;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFileLocally(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFileLocally(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const hasErrors = localError || (validation && !validation.isValid);
  const isValidated = validation?.isValid;

  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200",
          !isLoading && "cursor-pointer",
          isDragging && "border-primary bg-primary/5 scale-[1.01]",
          !isDragging && !hasErrors && !isValidated && "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
          isValidated && "border-success/50 bg-success/5",
          hasErrors && "border-destructive/50 bg-destructive/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
            <div>
              <p className="font-medium text-foreground">Processando arquivo...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Validando estrutura e detectando tipos de dados
              </p>
            </div>
          </div>
        ) : isValidated && validation?.fileInfo ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <FileUp className="w-16 h-16 mx-auto text-success" />
              <CheckCircle2 className="w-6 h-6 absolute -bottom-1 -right-1 text-success bg-background rounded-full" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{validation.fileInfo.name}</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <Badge variant="outline" className="text-success border-success/30">
                  {formatFileSize(validation.fileInfo.size)}
                </Badge>
                <Badge variant="outline" className="uppercase">
                  {validation.fileInfo.extension}
                </Badge>
              </div>
              <p className="text-sm text-success mt-3 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Arquivo válido e pronto para processamento
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={cn(
              "transition-transform duration-200",
              isDragging && "scale-110"
            )}>
              <FileSpreadsheet className={cn(
                "w-16 h-16 mx-auto transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className={cn(
                "font-semibold text-lg transition-colors",
                isDragging ? "text-primary" : "text-foreground"
              )}>
                {isDragging ? "Solte o arquivo aqui!" : "Arraste e solte um arquivo"}
              </p>
              <p className="text-muted-foreground mt-1">
                ou <span className="text-primary underline cursor-pointer">clique para selecionar</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Badge variant="secondary">CSV</Badge>
              <Badge variant="secondary">XLSX</Badge>
              <Badge variant="secondary">XLS</Badge>
              <span className="text-xs text-muted-foreground">máx. {maxSizeMB}MB</span>
            </div>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Validation Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Formato válido</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Tamanho OK</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Encoding UTF-8</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Estrutura válida</span>
        </div>
      </div>

      {/* Error Display */}
      {(localError || (validation && !validation.isValid)) && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Erro na validação</p>
              <p className="text-sm text-destructive/80 mt-1">
                {localError || validation?.errors[0]?.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
