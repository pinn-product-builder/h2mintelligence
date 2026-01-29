import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { FileSpreadsheet, FileUp, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  accept?: string;
  maxSizeMB?: number;
  compact?: boolean;
}

export function FileDropZone({ 
  onFileSelect, 
  selectedFile, 
  onClearFile,
  accept = '.csv,.xlsx,.xls,.pdf,.docx,.doc',
  maxSizeMB = 10,
  compact = false
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    const validExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError(`Tipo de arquivo não suportado. Use: ${accept}`);
      return false;
    }
    
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
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
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-2">
      <div
        onClick={!selectedFile ? handleClick : undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          !selectedFile && "cursor-pointer",
          isDragging && "border-primary bg-primary/5 scale-[1.02]",
          !isDragging && !selectedFile && "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
          selectedFile && "border-status-success/50 bg-status-success/5",
          error && "border-destructive/50 bg-destructive/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <FileUp className="w-14 h-14 mx-auto text-status-success" />
              <CheckCircle2 className="w-5 h-5 absolute -bottom-1 -right-1 text-status-success bg-background rounded-full" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatFileSize(selectedFile.size)} • Pronto para importar
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClearFile();
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4 mr-1" />
              Remover arquivo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={cn(
              "transition-transform duration-200",
              isDragging && "scale-110"
            )}>
              <FileSpreadsheet className={cn(
                "w-14 h-14 mx-auto transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className={cn(
                "font-medium transition-colors",
                isDragging ? "text-primary" : "text-foreground"
              )}>
                {isDragging ? "Solte o arquivo aqui!" : "Arraste e solte um arquivo aqui"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ou <span className="text-primary underline cursor-pointer">clique para selecionar</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Suporta CSV, Excel, PDF, Word (máx. {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}

        {/* Drag overlay effect */}
        {isDragging && (
          <div className="absolute inset-0 rounded-lg bg-primary/5 pointer-events-none animate-pulse" />
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
