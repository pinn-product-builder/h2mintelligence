import { useState } from 'react';
import { FieldMapping, SYSTEM_FIELDS, TransformationType, ColumnDataType } from '@/types/dataHub';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRight, 
  Wand2, 
  X, 
  Plus,
  CheckCircle2,
  AlertCircle,
  Hash,
  Calendar,
  DollarSign,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColumnMapperProps {
  sourceColumns: string[];
  columnTypes: Record<string, ColumnDataType>;
  mappings: FieldMapping[];
  onMappingsChange: (mappings: FieldMapping[]) => void;
  onAutoMap?: () => void;
}

const transformationLabels: Record<TransformationType, string> = {
  none: 'Nenhuma',
  sum: 'SOMA',
  avg: 'MÉDIA',
  count: 'CONTAGEM',
  min: 'MÍNIMO',
  max: 'MÁXIMO',
  date_format: 'FORMATAR DATA',
};

const typeIcons: Record<ColumnDataType, React.ReactNode> = {
  text: <Type className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
  date: <Calendar className="w-3.5 h-3.5" />,
  currency: <DollarSign className="w-3.5 h-3.5" />,
  percentage: <Hash className="w-3.5 h-3.5" />,
  boolean: <Hash className="w-3.5 h-3.5" />,
};

export function ColumnMapper({
  sourceColumns,
  columnTypes,
  mappings,
  onMappingsChange,
  onAutoMap,
}: ColumnMapperProps) {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  
  const mappedSourceColumns = mappings.map(m => m.sourceColumn);
  const mappedTargetFields = mappings.map(m => m.targetField);
  
  const unmappedSourceColumns = sourceColumns.filter(col => !mappedSourceColumns.includes(col));
  const unmappedTargetFields = SYSTEM_FIELDS.filter(f => !mappedTargetFields.includes(f.id));
  const requiredUnmapped = SYSTEM_FIELDS.filter(f => f.isRequired && !mappedTargetFields.includes(f.id));
  
  const handleAddMapping = () => {
    if (!selectedSource || !selectedTarget) return;
    
    const targetField = SYSTEM_FIELDS.find(f => f.id === selectedTarget);
    const newMapping: FieldMapping = {
      id: `map-${Date.now()}`,
      sourceColumn: selectedSource,
      targetField: selectedTarget,
      transformation: 'none',
      isRequired: targetField?.isRequired || false,
      expectedType: targetField?.type,
    };
    
    onMappingsChange([...mappings, newMapping]);
    setSelectedSource('');
    setSelectedTarget('');
  };
  
  const handleRemoveMapping = (id: string) => {
    onMappingsChange(mappings.filter(m => m.id !== id));
  };
  
  const handleTransformationChange = (id: string, transformation: TransformationType) => {
    onMappingsChange(mappings.map(m => 
      m.id === id ? { ...m, transformation } : m
    ));
  };
  
  return (
    <div className="space-y-6">
      {/* Header with Auto-Map */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Mapeamento de Campos</h3>
          <p className="text-sm text-muted-foreground">
            Associe as colunas do arquivo aos campos do sistema
          </p>
        </div>
        {onAutoMap && (
          <Button variant="outline" onClick={onAutoMap} className="gap-2">
            <Wand2 className="w-4 h-4" />
            Auto-Mapear
          </Button>
        )}
      </div>
      
      {/* Required fields warning */}
      {requiredUnmapped.length > 0 && (
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Campos obrigatórios não mapeados</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {requiredUnmapped.map(field => (
                  <Badge key={field.id} variant="outline" className="text-warning border-warning/30">
                    {field.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Current Mappings */}
      <div className="space-y-3">
        {mappings.map(mapping => {
          const targetField = SYSTEM_FIELDS.find(f => f.id === mapping.targetField);
          const sourceType = columnTypes[mapping.sourceColumn] || 'text';
          
          return (
            <Card key={mapping.id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Source Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      {typeIcons[sourceType]}
                      <span className="font-medium truncate">{mapping.sourceColumn}</span>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  
                  {/* Target Field */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "flex items-center gap-2 p-3 rounded-lg",
                      targetField?.isRequired ? "bg-primary/10" : "bg-muted/50"
                    )}>
                      <span className="font-medium truncate">{targetField?.label}</span>
                      {targetField?.isRequired && (
                        <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Transformation */}
                  <Select
                    value={mapping.transformation}
                    onValueChange={(v) => handleTransformationChange(mapping.id, v as TransformationType)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(transformationLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveMapping(mapping.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Add New Mapping */}
      {unmappedSourceColumns.length > 0 && unmappedTargetFields.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma coluna..." />
                </SelectTrigger>
                <SelectContent>
                  {unmappedSourceColumns.map(col => (
                    <SelectItem key={col} value={col}>
                      <div className="flex items-center gap-2">
                        {typeIcons[columnTypes[col] || 'text']}
                        {col}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um campo..." />
                </SelectTrigger>
                <SelectContent>
                  {unmappedTargetFields.map(field => (
                    <SelectItem key={field.id} value={field.id}>
                      <div className="flex items-center gap-2">
                        {field.label}
                        {field.isRequired && (
                          <span className="text-xs text-warning">*</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleAddMapping}
                disabled={!selectedSource || !selectedTarget}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{mappings.length} campos mapeados</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{unmappedSourceColumns.length} colunas disponíveis</span>
        </div>
      </div>
    </div>
  );
}
