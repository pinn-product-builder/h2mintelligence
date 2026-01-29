import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { sectorLabels } from '@/data/mockData';
import { OKRCard } from '@/components/dashboard/OKRCard';
import { NewOKRForm } from '@/components/okr/NewOKRForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, LayoutGrid, List, Target, CheckCircle, AlertTriangle, AlertCircle, EyeOff, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const cycles = [
  { id: 'q1-2026', label: 'Q1 2026', active: true },
  { id: 'q2-2026', label: 'Q2 2026', active: false },
  { id: 'q3-2026', label: 'Q3 2026', active: false },
  { id: 'q4-2026', label: 'Q4 2026', active: false },
];

export function OKRsSection() {
  const { objectives } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('q1-2026');

  const filteredObjectives = objectives.filter(obj => {
    const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: objectives.length,
    onTrack: objectives.filter(o => o.status === 'on-track').length,
    attention: objectives.filter(o => o.status === 'attention').length,
    critical: objectives.filter(o => o.status === 'critical').length,
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

      {/* Cycle Selector - Apenas ciclos atuais e futuros */}
      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        {cycles.map((cycle) => (
          <button
            key={cycle.id}
            onClick={() => setSelectedCycle(cycle.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              selectedCycle === cycle.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {cycle.label}
            {cycle.active && (
              <span className="ml-2 w-2 h-2 rounded-full bg-success inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* OKRs Content */}
      <div>
        {selectedCycle === 'q1-2026' ? (
          <>
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredObjectives.map((objective, index) => (
                <OKRCard key={objective.id} objective={objective} index={index} />
              ))}
            </div>
            
            {filteredObjectives.length === 0 && (
              <div className="card-elevated p-8 text-center text-muted-foreground">
                <p>Nenhum OKR encontrado com os filtros aplicados.</p>
              </div>
            )}
          </>
        ) : (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            <p>Ciclo futuro. Planejamento ainda não iniciado.</p>
          </div>
        )}
      </div>
    </div>
  );
}