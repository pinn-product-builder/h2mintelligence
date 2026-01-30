import { Target, CheckCircle2, AlertCircle, XCircle, TrendingUp } from 'lucide-react';
import { useObjectives, useCycles } from '@/hooks/useSupabaseData';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export function QuickStats() {
  const { data: cycles = [] } = useCycles();
  const activeCycle = cycles.find(c => c.is_active && !c.is_archived);
  const { data: objectives = [] } = useObjectives(activeCycle?.id);

  const stats = useMemo(() => {
    const totalOKRs = objectives.length;
    const onTrack = objectives.filter(o => o.status === 'on-track').length;
    const attention = objectives.filter(o => o.status === 'attention').length;
    const critical = objectives.filter(o => o.status === 'critical').length;
    const avgProgress = totalOKRs > 0 
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / totalOKRs)
      : 0;

    return { totalOKRs, onTrack, attention, critical, avgProgress };
  }, [objectives]);

  const cycleName = activeCycle?.name || 'Ciclo Atual';

  return (
    <div className="card-elevated p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Resumo {cycleName}</h3>
        <TrendingUp className="w-4 h-4 text-accent" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="text-center p-4 rounded-xl bg-muted/40 border border-border/50 transition-all hover:bg-muted/60">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-2xl font-bold text-foreground tabular-nums">{stats.totalOKRs}</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">Total OKRs</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-accent/5 border border-accent/20 transition-all hover:bg-accent/10">
          <span className="text-2xl font-bold text-accent tabular-nums">{stats.avgProgress}%</span>
          <p className="text-xs text-muted-foreground font-medium">Média Geral</p>
        </div>
      </div>

      {/* Status List */}
      <div className="space-y-2">
        <StatusRow 
          icon={CheckCircle2} 
          label="No Prazo" 
          count={stats.onTrack} 
          colorClass="text-success"
          bgClass="bg-success/10 hover:bg-success/15"
        />
        <StatusRow 
          icon={AlertCircle} 
          label="Atenção" 
          count={stats.attention} 
          colorClass="text-warning"
          bgClass="bg-warning/10 hover:bg-warning/15"
        />
        <StatusRow 
          icon={XCircle} 
          label="Crítico" 
          count={stats.critical} 
          colorClass="text-critical"
          bgClass="bg-critical/10 hover:bg-critical/15"
        />
      </div>
    </div>
  );
}

interface StatusRowProps {
  icon: React.ElementType;
  label: string;
  count: number;
  colorClass: string;
  bgClass: string;
}

function StatusRow({ icon: Icon, label, count, colorClass, bgClass }: StatusRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-default",
      bgClass
    )}>
      <div className="flex items-center gap-2.5">
        <Icon className={cn("w-4 h-4", colorClass)} strokeWidth={2} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className={cn("font-bold tabular-nums", colorClass)}>{count}</span>
    </div>
  );
}
