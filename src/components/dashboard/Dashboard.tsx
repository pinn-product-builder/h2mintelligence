import { MetricCard } from './MetricCard';
import { OKRCard } from './OKRCard';
import { SectorOverview } from './SectorOverview';
import { QuickStats } from './QuickStats';
import { NewOKRForm } from '@/components/okr/NewOKRForm';
import { TaskForm } from '@/components/okr/TaskForm';
import { useObjectives, useSectors, useCycles } from '@/hooks/useSupabaseData';
import { Plus, Filter, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { MetricCard as MetricCardType, SectorSummary } from '@/types/okr';
import { SkeletonMetricCard, SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export function Dashboard() {
  const { data: cycles = [] } = useCycles();
  const activeCycle = cycles.find(c => c.is_active && !c.is_archived);
  const { data: objectives = [], isLoading: objectivesLoading } = useObjectives(activeCycle?.id);
  const { data: sectors = [], isLoading: sectorsLoading } = useSectors();

  // Calculate metrics from real data
  const metrics: MetricCardType[] = useMemo(() => {
    const onTrackOkrs = objectives.filter(o => o.status === 'on-track').length;
    const attentionOkrs = objectives.filter(o => o.status === 'attention' || o.status === 'critical').length;
    
    // Count all tasks from key results
    const allTasks = objectives.flatMap(o => 
      (o.key_results || []).flatMap(kr => kr.tasks || [])
    );
    const onTimeTasks = allTasks.filter(t => t.status === 'completed' || (t.status !== 'blocked' && (!t.due_date || new Date(t.due_date) >= new Date()))).length;
    const lateTasks = allTasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()).length;

    return [
      {
        id: '1',
        title: 'OKRs no Prazo',
        value: String(onTrackOkrs),
        change: objectives.length > 0 ? Math.round((onTrackOkrs / objectives.length) * 100) : 0,
        changeLabel: `de ${objectives.length} OKRs ativos`,
        icon: 'target',
        variant: 'success' as const,
      },
      {
        id: '2',
        title: 'OKRs em Atraso',
        value: String(attentionOkrs),
        change: objectives.length > 0 ? -Math.round((attentionOkrs / objectives.length) * 100) : 0,
        changeLabel: 'precisam atenção',
        icon: 'alert-triangle',
        variant: 'warning' as const,
      },
      {
        id: '3',
        title: 'Atividades no Prazo',
        value: String(onTimeTasks),
        change: allTasks.length > 0 ? Math.round((onTimeTasks / allTasks.length) * 100) : 0,
        changeLabel: `de ${allTasks.length} atividades`,
        icon: 'check-circle',
        variant: 'success' as const,
      },
      {
        id: '4',
        title: 'Atividades em Atraso',
        value: String(lateTasks),
        change: allTasks.length > 0 ? -Math.round((lateTasks / allTasks.length) * 100) : 0,
        changeLabel: 'necessitam revisão',
        icon: 'clock',
        variant: 'critical' as const,
      },
    ];
  }, [objectives]);

  // Calculate sector summary from real data
  const sectorSummary: SectorSummary[] = useMemo(() => {
    return sectors.map(sector => {
      const sectorObjectives = objectives.filter(o => o.sector_id === sector.id);
      const avgProgress = sectorObjectives.length > 0 
        ? Math.round(sectorObjectives.reduce((sum, o) => sum + o.progress, 0) / sectorObjectives.length)
        : 0;
      
      return {
        sector: sector.id,
        label: sector.name,
        totalOKRs: sectorObjectives.length,
        avgProgress,
        onTrack: sectorObjectives.filter(o => o.status === 'on-track').length,
        attention: sectorObjectives.filter(o => o.status === 'attention').length,
        critical: sectorObjectives.filter(o => o.status === 'critical').length,
      };
    }).filter(s => s.totalOKRs > 0);
  }, [sectors, objectives]);

  // Transform objectives to old format for OKRCard
  const transformedObjectives = useMemo(() => {
    return objectives.slice(0, 4).map(obj => ({
      id: obj.id,
      title: obj.title,
      description: obj.description || '',
      sector: obj.sector_id || '',
      owner: obj.owner?.name || '',
      period: activeCycle?.name || '',
      priority: 'medium' as const,
      progress: obj.progress,
      status: obj.status as any,
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
      keyResults: (obj.key_results || []).map(kr => ({
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
          parentOKRId: obj.id,
        })),
      })),
    }));
  }, [objectives, activeCycle]);

  const isLoading = objectivesLoading || sectorsLoading;

  // Skeleton Loading State
  if (isLoading && objectives.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Metrics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-9 w-20 bg-muted rounded animate-pulse" />
                <div className="h-9 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OKRs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              OKRs Ativos {activeCycle && `- ${activeCycle.name}`}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrar
              </Button>
              <TaskForm
                trigger={
                  <Button variant="outline" size="sm" className="gap-2">
                    <ListTodo className="w-4 h-4" />
                    Nova Tarefa
                  </Button>
                }
              />
              <NewOKRForm 
                trigger={
                  <Button size="sm" className="gap-2 gradient-accent text-accent-foreground border-0">
                    <Plus className="w-4 h-4" />
                    Novo OKR
                  </Button>
                } 
              />
            </div>
          </div>
          
          {transformedObjectives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transformedObjectives.map((objective, index) => (
                <OKRCard key={objective.id} objective={objective} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState 
              variant="okr"
              title="Nenhum OKR cadastrado"
              description="Clique em 'Novo OKR' para criar seu primeiro objetivo."
            />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <QuickStats />
          <SectorOverview sectors={sectorSummary} />
        </div>
      </div>
    </div>
  );
}
