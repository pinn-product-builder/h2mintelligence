import { useSectors, useCycles, useObjectives, useArchivedObjectives, useUpdateObjective, useProfiles } from '@/hooks/useSupabaseData';
import { OKRCard } from '@/components/dashboard/OKRCard';
import { NewOKRForm } from '@/components/okr/NewOKRForm';
import { CycleManager } from '@/components/okr/CycleManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, LayoutGrid, List, Target, CheckCircle, AlertTriangle, AlertCircle, FolderArchive, RotateCcw, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';

export function OKRsSection() {
  const { data: sectors = [], isLoading: sectorsLoading } = useSectors();
  const { data: cycles = [], isLoading: cyclesLoading } = useCycles();
  const { data: archivedObjectives = [] } = useArchivedObjectives();
  const updateObjective = useUpdateObjective();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('ativos');
  
  const activeCycles = useMemo(() => cycles.filter(c => !c.is_archived), [cycles]);
  const archivedCycles = useMemo(() => cycles.filter(c => c.is_archived), [cycles]);
  
  const [selectedCycleId, setSelectedCycleId] = useState<string>(() => {
    const activeCycle = activeCycles.find(c => c.is_active);
    return activeCycle?.id || '';
  });

  // Update selectedCycleId when cycles load
  useMemo(() => {
    if (activeCycles.length > 0 && !selectedCycleId) {
      const activeCycle = activeCycles.find(c => c.is_active);
      setSelectedCycleId(activeCycle?.id || activeCycles[0]?.id || '');
    }
  }, [activeCycles, selectedCycleId]);

  const { data: objectives = [], isLoading: objectivesLoading } = useObjectives(selectedCycleId);

  const filteredObjectives = useMemo(() => {
    return objectives.filter(obj => {
      const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [objectives, searchTerm, statusFilter]);

  const filteredArchivedObjectives = useMemo(() => {
    return archivedObjectives.filter(obj => {
      const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [archivedObjectives, searchTerm]);

  const stats = useMemo(() => ({
    total: objectives.length,
    onTrack: objectives.filter(o => o.status === 'on-track').length,
    attention: objectives.filter(o => o.status === 'attention').length,
    critical: objectives.filter(o => o.status === 'critical').length,
  }), [objectives]);

  const restoreObjective = async (id: string) => {
    await updateObjective.mutateAsync({ id, is_archived: false });
  };

  const getSectorLabel = (sectorId?: string) => {
    if (!sectorId) return '';
    const sector = sectors.find(s => s.id === sectorId);
    return sector?.name || '';
  };

  const getSelectedCycleName = () => {
    const cycle = activeCycles.find(c => c.id === selectedCycleId);
    return cycle?.name || '';
  };

  const isLoading = sectorsLoading || cyclesLoading || objectivesLoading;

  if (isLoading && objectives.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="ativos" className="gap-2">
            <Target className="w-4 h-4" />
            Ativos ({objectives.length})
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <FolderArchive className="w-4 h-4" />
            Histórico ({archivedObjectives.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="mt-4 space-y-4">
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

          {/* Cycle Selector */}
          <div className="flex items-center gap-3">
            <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {activeCycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id}>
                    <div className="flex items-center gap-2">
                      <span>{cycle.name}</span>
                      {cycle.is_active && (
                        <span className="w-2 h-2 rounded-full bg-success" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CycleManager />
          </div>

          {/* OKRs Content */}
          <div>
            {filteredObjectives.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredObjectives.map((objective, index) => (
                  <OKRCard 
                    key={objective.id} 
                    objective={{
                      id: objective.id,
                      title: objective.title,
                      description: objective.description || '',
                      sector: objective.sector_id || '',
                      owner: objective.owner?.name || '',
                      period: getSelectedCycleName(),
                      priority: 'medium',
                      progress: objective.progress,
                      status: objective.status as any,
                      createdAt: objective.created_at,
                      updatedAt: objective.updated_at,
                      keyResults: (objective.key_results || []).map(kr => ({
                        id: kr.id,
                        title: kr.title,
                        type: kr.type as any,
                        current: kr.current_value,
                        target: kr.target_value,
                        baseline: 0,
                        unit: kr.unit || '',
                        owner: kr.owner?.name || '',
                        progress: kr.target_value > 0 ? Math.round((kr.current_value / kr.target_value) * 100) : 0,
                        status: kr.status as any,
                        lastUpdate: kr.updated_at,
                        tasks: (kr.tasks || []).map(t => ({
                          id: t.id,
                          title: t.title,
                          description: t.description,
                          assignedTo: t.assignee_id || '',
                          assignedToName: t.assignee?.name || '',
                          dueDate: t.due_date,
                          priority: t.priority as any,
                          status: t.status as any,
                          createdAt: t.created_at,
                          completedAt: t.completed_at,
                          parentKRId: t.key_result_id,
                          parentOKRId: objective.id,
                        })),
                      })),
                    }} 
                    index={index} 
                  />
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center text-muted-foreground">
                <p>Nenhum OKR encontrado para este ciclo.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar no histórico..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredArchivedObjectives.length > 0 ? (
            <div className="space-y-3">
              {filteredArchivedObjectives.map((objective) => (
                <div
                  key={objective.id}
                  className="card-elevated p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {getSectorLabel(objective.sector_id)}
                      </span>
                    </div>
                    <p className="font-medium truncate">{objective.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Progresso final: {objective.progress}%
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => restoreObjective(objective.id)}
                    disabled={updateObjective.isPending}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elevated p-8 text-center text-muted-foreground">
              <FolderArchive className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum OKR arquivado.</p>
              <p className="text-sm">OKRs concluídos (100%) podem ser arquivados para histórico.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {archivedCycles.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <FolderArchive className="w-4 h-4" />
          <span>
            {archivedCycles.length} ciclo{archivedCycles.length !== 1 ? 's' : ''} arquivado{archivedCycles.length !== 1 ? 's' : ''}.
          </span>
        </div>
      )}
    </div>
  );
}
