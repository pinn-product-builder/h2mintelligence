import { useState, useMemo } from 'react';
import { ParsedDocument, DataRow } from '@/hooks/useDocumentParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, ArrowRight, Check, X, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FieldMapping {
  krTitle?: string;
  krTarget?: string;
  krBaseline?: string;
  krUnit?: string;
  krOwner?: string;
}

export interface MappingResult {
  mapping: FieldMapping;
  selectedRows: number[];
  autoCreateKRs: boolean;
}

interface DocumentDataMapperProps {
  document: ParsedDocument;
  onApplyMapping: (result: MappingResult) => void;
  onCancel: () => void;
}

const OKR_FIELDS = [
  { key: 'krTitle', label: 'KR: Título', suggestions: ['título', 'nome', 'descrição', 'key result', 'indicador', 'objetivo'] },
  { key: 'krTarget', label: 'KR: Meta', suggestions: ['meta', 'target', 'objetivo', 'alvo', 'esperado'] },
  { key: 'krBaseline', label: 'KR: Baseline', suggestions: ['baseline', 'atual', 'inicial', 'valor atual', 'corrente'] },
  { key: 'krUnit', label: 'KR: Unidade', suggestions: ['unidade', 'unit', 'tipo', 'medida'] },
  { key: 'krOwner', label: 'KR: Responsável', suggestions: ['responsável', 'owner', 'dono', 'vendedor', 'gestor'] },
];

function findBestMatch(columns: string[], suggestions: string[]): string | undefined {
  const normalizedSuggestions = suggestions.map(s => s.toLowerCase());
  
  for (const col of columns) {
    const normalizedCol = col.toLowerCase();
    if (normalizedSuggestions.some(s => normalizedCol.includes(s) || s.includes(normalizedCol))) {
      return col;
    }
  }
  return undefined;
}

function formatValue(value: string | number): string {
  if (typeof value === 'number') {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString('pt-BR');
  }
  return String(value);
}

export function DocumentDataMapper({ document, onApplyMapping, onCancel }: DocumentDataMapperProps) {
  const [mapping, setMapping] = useState<FieldMapping>(() => {
    // Auto-suggest initial mappings
    const initial: FieldMapping = {};
    OKR_FIELDS.forEach(field => {
      const match = findBestMatch(document.columns, field.suggestions);
      if (match) {
        initial[field.key as keyof FieldMapping] = match;
      }
    });
    return initial;
  });
  
  const [selectedRows, setSelectedRows] = useState<number[]>(() => 
    document.data.slice(0, 5).map((_, i) => i)
  );
  const [autoCreateKRs, setAutoCreateKRs] = useState(true);

  const previewData = useMemo(() => {
    return document.data.slice(0, 5);
  }, [document.data]);

  const handleMappingChange = (fieldKey: keyof FieldMapping, column: string | undefined) => {
    setMapping(prev => ({
      ...prev,
      [fieldKey]: column === '_none_' ? undefined : column
    }));
  };

  const toggleRow = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleAutoSuggest = () => {
    const suggested: FieldMapping = {};
    OKR_FIELDS.forEach(field => {
      const match = findBestMatch(document.columns, field.suggestions);
      if (match) {
        suggested[field.key as keyof FieldMapping] = match;
      }
    });
    setMapping(suggested);
  };

  const handleApply = () => {
    onApplyMapping({
      mapping,
      selectedRows,
      autoCreateKRs
    });
  };

  const mappedCount = Object.values(mapping).filter(Boolean).length;

  return (
    <Card className="border-primary/20 bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Dados Extraídos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {document.columns.length} colunas
            </Badge>
            <Badge variant="secondary">
              {document.recordCount} registros
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Arquivo: <span className="font-medium">{document.fileName}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mapping Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Mapeamento de Campos</h4>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleAutoSuggest}
              className="text-xs gap-1"
            >
              <Wand2 className="w-3 h-3" />
              Auto-sugerir
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OKR_FIELDS.map(field => (
              <div key={field.key} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-28 shrink-0">
                  {field.label}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select 
                  value={mapping[field.key as keyof FieldMapping] || '_none_'} 
                  onValueChange={(v) => handleMappingChange(field.key as keyof FieldMapping, v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Selecionar coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">
                      <span className="text-muted-foreground">Não mapear</span>
                    </SelectItem>
                    {document.columns.map(col => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {mappedCount} de {OKR_FIELDS.length} campos mapeados
          </p>
        </div>

        {/* Preview Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Preview dos Dados ({previewData.length} primeiros registros)</h4>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectedRows.length === previewData.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRows(previewData.map((_, i) => i));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                    />
                  </TableHead>
                  {document.columns.slice(0, 5).map(col => (
                    <TableHead key={col} className="text-xs whitespace-nowrap">
                      {col}
                      {Object.values(mapping).includes(col) && (
                        <Check className="w-3 h-3 inline ml-1 text-primary" />
                      )}
                    </TableHead>
                  ))}
                  {document.columns.length > 5 && (
                    <TableHead className="text-xs text-muted-foreground">
                      +{document.columns.length - 5} cols
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow 
                    key={index}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedRows.includes(index) && "bg-primary/5"
                    )}
                    onClick={() => toggleRow(index)}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedRows.includes(index)}
                        onCheckedChange={() => toggleRow(index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    {document.columns.slice(0, 5).map(col => (
                      <TableCell key={col} className="text-sm">
                        {formatValue(row[col])}
                      </TableCell>
                    ))}
                    {document.columns.length > 5 && (
                      <TableCell className="text-muted-foreground">...</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Auto-create KRs option */}
        <div className="flex items-center gap-2 pt-2">
          <Checkbox 
            id="auto-create" 
            checked={autoCreateKRs} 
            onCheckedChange={(checked) => setAutoCreateKRs(!!checked)} 
          />
          <label htmlFor="auto-create" className="text-sm cursor-pointer">
            Criar Key Results automaticamente das linhas selecionadas ({selectedRows.length})
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
          <Button 
            type="button" 
            size="sm" 
            onClick={handleApply}
            disabled={mappedCount === 0}
            className="gradient-accent text-accent-foreground border-0"
          >
            <Check className="w-4 h-4 mr-1" />
            Aplicar Mapeamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
