import { useState, useMemo } from 'react';
import { Search, Target, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useObjectives, useCycles, Objective, KeyResult } from '@/hooks/useSupabaseData';

interface KRMapProps {
  selectedKRId?: string;
  onSelectKR: (krId: string, okrId: string, krTitle: string, okrTitle: string, progress: number, status: string) => void;
  cycleFilter?: string;
}

const statusConfig = {
  'on-track': { label: 'No Prazo', className: 'bg-success/10 text-success border-success/20' },
  'attention': { label: 'Atenção', className: 'bg-warning/10 text-warning border-warning/20' },
  'critical': { label: 'Crítico', className: 'bg-critical/10 text-critical border-critical/20' },
  'completed': { label: 'Concluído', className: 'bg-primary/10 text-primary border-primary/20' },
};

function calculateKRProgress(kr: KeyResult): number {
  if (kr.type === 'boolean') {
    return kr.current_value >= 1 ? 100 : 0;
  }
  if (kr.target_value === 0) return 0;
  return Math.min(100, (kr.current_value / kr.target_value) * 100);
}

export function KRMap({ selectedKRId, onSelectKR, cycleFilter }: KRMapProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: cycles = [] } = useCycles();
  const activeCycleId = cycleFilter || cycles.find(c => c.is_active)?.id;
  const { data: objectives = [], isLoading } = useObjectives(activeCycleId);

  // Group objectives by sector
  const groupedBySector = useMemo(() => {
    const filtered = objectives.filter(obj => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const matchesOKR = obj.title.toLowerCase().includes(search);
      const matchesKR = obj.key_results?.some(kr => kr.title.toLowerCase().includes(search));
      return matchesOKR || matchesKR;
    });

    const groups: Record<string, { sectorName: string; sectorColor: string; objectives: Objective[] }> = {};
    
    filtered.forEach(obj => {
      const sectorId = obj.sector_id || 'sem-setor';
      const sectorName = obj.sector?.name || 'Sem Setor';
      const sectorColor = obj.sector?.color || '#6366f1';
      
      if (!groups[sectorId]) {
        groups[sectorId] = { sectorName, sectorColor, objectives: [] };
      }
      groups[sectorId].objectives.push(obj);
    });

    return Object.entries(groups).sort((a, b) => a[1].sectorName.localeCompare(b[1].sectorName));
  }, [objectives, searchTerm]);

  // Calculate default expanded items
  const defaultExpanded = useMemo(() => {
    if (groupedBySector.length <= 2) {
      return groupedBySector.map(([sectorId]) => sectorId);
    }
    return [];
  }, [groupedBySector]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (objectives.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum OKR encontrado no ciclo ativo</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar OKR ou Key Result..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Tree View */}
      <ScrollArea className="h-[280px] pr-3">
        <Accordion type="multiple" defaultValue={defaultExpanded} className="space-y-1">
          {groupedBySector.map(([sectorId, { sectorName, sectorColor, objectives: sectorObjs }]) => (
            <AccordionItem key={sectorId} value={sectorId} className="border-0">
              <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: sectorColor }}
                  />
                  <span>{sectorName}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {sectorObjs.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="ml-3 border-l border-border pl-3 space-y-1">
                  {sectorObjs.map(obj => (
                    <OKRItem
                      key={obj.id}
                      objective={obj}
                      selectedKRId={selectedKRId}
                      onSelectKR={onSelectKR}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {groupedBySector.length === 0 && searchTerm && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Nenhum resultado para "{searchTerm}"</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface OKRItemProps {
  objective: Objective;
  selectedKRId?: string;
  onSelectKR: (krId: string, okrId: string, krTitle: string, okrTitle: string, progress: number, status: string) => void;
  searchTerm: string;
}

function OKRItem({ objective, selectedKRId, onSelectKR, searchTerm }: OKRItemProps) {
  const [expanded, setExpanded] = useState(() => {
    // Auto-expand if search matches a KR within this OKR
    if (searchTerm) {
      return objective.key_results?.some(kr => 
        kr.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return false;
  });

  const keyResults = objective.key_results || [];

  return (
    <div className="space-y-1">
      {/* OKR Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 text-left transition-colors"
      >
        <ChevronRight 
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform",
            expanded && "rotate-90"
          )} 
        />
        <Target className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-sm truncate flex-1">{objective.title}</span>
        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">
          {keyResults.length} KR{keyResults.length !== 1 ? 's' : ''}
        </Badge>
      </button>

      {/* Key Results */}
      {expanded && keyResults.length > 0 && (
        <div className="ml-5 border-l border-border/50 pl-3 space-y-0.5">
          {keyResults.map(kr => {
            const progress = calculateKRProgress(kr);
            const status = kr.status || 'on-track';
            const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig['on-track'];
            const isSelected = selectedKRId === kr.id;

            return (
              <button
                key={kr.id}
                type="button"
                onClick={() => onSelectKR(kr.id, objective.id, kr.title, objective.title, progress, status)}
                className={cn(
                  "w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-left transition-all",
                  isSelected 
                    ? "bg-accent/15 border border-accent/40" 
                    : "hover:bg-muted/50 border border-transparent"
                )}
              >
                <TrendingUp className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  isSelected ? "text-accent" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm truncate flex-1",
                  isSelected && "font-medium"
                )}>
                  {kr.title}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {progress.toFixed(0)}%
                </span>
                <Badge 
                  variant="outline" 
                  className={cn("text-[9px] px-1 py-0 h-3.5 shrink-0", statusInfo.className)}
                >
                  {statusInfo.label}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {expanded && keyResults.length === 0 && (
        <div className="ml-8 py-2 text-xs text-muted-foreground">
          Nenhum Key Result cadastrado
        </div>
      )}
    </div>
  );
}
