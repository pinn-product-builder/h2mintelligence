import { IMPORT_TEMPLATES, ImportTemplate } from '@/data/importTemplates';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  DollarSign, 
  Package, 
  Megaphone, 
  Target,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  selectedTemplate: ImportTemplate | null;
  onSelect: (template: ImportTemplate | null) => void;
  matchedTemplateId?: string;
  matchScore?: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Financeiro': <DollarSign className="w-4 h-4" />,
  'Operações': <Package className="w-4 h-4" />,
  'Marketing': <Megaphone className="w-4 h-4" />,
  'Geral': <Target className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  'Financeiro': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Operações': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Marketing': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Geral': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export function TemplateSelector({ selectedTemplate, onSelect, matchedTemplateId, matchScore }: TemplateSelectorProps) {
  const grouped = IMPORT_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, ImportTemplate[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Templates de Importação</h3>
          <p className="text-sm text-muted-foreground">
            Selecione um modelo para pré-configurar os mapeamentos automaticamente
          </p>
        </div>
        {selectedTemplate && (
          <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
            Limpar seleção
          </Button>
        )}
      </div>

      {Object.entries(grouped).map(([category, templates]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {categoryIcons[category]}
            {category}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map(template => {
              const isSelected = selectedTemplate?.id === template.id;
              const isMatched = matchedTemplateId === template.id;

              return (
                <Card
                  key={template.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'ring-2 ring-primary shadow-md',
                    isMatched && !isSelected && 'ring-1 ring-primary/50'
                  )}
                  onClick={() => onSelect(isSelected ? null : template)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{template.name}</span>
                          {isMatched && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                              <Sparkles className="w-3 h-3" />
                              {matchScore ? `${Math.round(matchScore * 100)}%` : 'Match'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <FileSpreadsheet className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-mono">
                            {template.exampleHint}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
