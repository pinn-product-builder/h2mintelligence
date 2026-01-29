import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { OKRCard } from '@/components/dashboard/OKRCard';
import { NewOKRForm } from '@/components/okr/NewOKRForm';
import { CycleManager } from '@/components/okr/CycleManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, LayoutGrid, List, Target, CheckCircle, AlertTriangle, AlertCircle, EyeOff, Eye, FolderArchive } from 'lucide-react';

export function OKRsSection() {
  const { objectives, cycles, archivedCycles } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(() => {
    const activeCycle = cycles.find(c => c.isActive && !c.isArchived);
    return activeCycle?.label || cycles.filter(c => !c.isArchived)[0]?.label || '';
  });

  const activeCycles = cycles.filter(c => !c.isArchived);

  const filteredObjectives = objectives.filter(obj => {
    const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
    const matchesCycle = obj.period === selectedCycle;
    return matchesSearch && matchesStatus && matchesCycle;
  });

  const cycleObjectives = objectives.filter(obj => obj.period === selectedCycle);
  const stats = {
    total: cycleObjectives.length,
    onTrack: cycleObjectives.filter(o => o.status === 'on-track').length,
    attention: cycleObjectives.filter(o => o.status === 'attention').length,
    critical: cycleObjectives.filter(o => o.status === 'critical').length,
  };

  const getOKRCountForCycle = (cycleLabel: string) => {
    return objectives.filter(obj => obj.period === cycleLabel).length;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards - Topo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total de OKRs</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-success">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{stats.onTrack}</p>
              <p className="text-sm text-muted-foreground">No Prazo</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-warning">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{stats.attention}</p>
              <p className="text-sm text-muted-foreground">Atenção</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-critical">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-critical/10">
              <AlertCircle className="w-5 h-5 text-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold text-critical">{stats.critical}</p>
              <p className="text-sm text-muted-foreground">Crítico</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar OKRs..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="on-track">No Prazo</SelectItem>
              <SelectItem value="attention">Atenção</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="gap-2"
          >
            {showArchived ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showArchived ? 'Mostrando Arquivados' : 'Ocultar Arquivados'}
          </Button>
          <div className="flex items-center border rounded-lg p-1">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <NewOKRForm />
        </div>
      </div>

      {/* Cycle Selector - Dropdown dinâmico */}
      <div className="flex items-center gap-3">
        <Select value={selectedCycle} onValueChange={setSelectedCycle}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {activeCycles.map((cycle) => {
              const okrCount = getOKRCountForCycle(cycle.label);
              return (
                <SelectItem key={cycle.id} value={cycle.label}>
                  <div className="flex items-center gap-2">
                    <span>{cycle.label}</span>
                    {cycle.isActive && (
                      <span className="w-2 h-2 rounded-full bg-success" />
                    )}
                    <span className="text-muted-foreground text-xs">
                      ({okrCount} OKR{okrCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <CycleManager />
      </div>

      {/* OKRs Content */}
      <div>
        {filteredObjectives.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredObjectives.map((objective, index) => (
              <OKRCard key={objective.id} objective={objective} index={index} />
            ))}
          </div>
        ) : (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            <p>Nenhum OKR encontrado para este ciclo.</p>
          </div>
        )}
      </div>

      {/* Rodapé informativo sobre histórico */}
      {archivedCycles.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <FolderArchive className="w-4 h-4" />
          <span>
            {archivedCycles.length} período{archivedCycles.length !== 1 ? 's' : ''} arquivado{archivedCycles.length !== 1 ? 's' : ''}.
            Ver em: <strong>Configurações &gt; Histórico de Ciclos</strong>
          </span>
        </div>
      )}
    </div>
  );
}
