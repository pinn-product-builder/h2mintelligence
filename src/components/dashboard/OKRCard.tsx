import { useState, useMemo } from 'react';
import { Objective } from '@/types/okr';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { useSectors } from '@/hooks/useSupabaseData';
import { ChevronRight, User, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { OKRDetailModal } from '@/components/okr/OKRDetailModal';

interface OKRCardProps {
  objective: Objective;
  index: number;
}

// Generate mock weekly progress data based on current progress
function generateWeeklyProgress(currentProgress: number, status: string) {
  const weeks = 12;
  const currentWeek = 4;
  const data = [];
  
  for (let i = 1; i <= weeks; i++) {
    if (i <= currentWeek) {
      const baseProgress = (currentProgress / currentWeek) * i;
      const variance = (Math.random() - 0.5) * 10;
      data.push({
        week: `S${i}`,
        progress: Math.max(0, Math.min(100, Math.round(baseProgress + variance))),
      });
    } else {
      data.push({
        week: `S${i}`,
        progress: null,
      });
    }
  }
  
  if (currentWeek > 0 && currentWeek <= weeks) {
    data[currentWeek - 1].progress = currentProgress;
  }
  
  return data;
}

// Calculate trend based on recent progress
function calculateTrend(data: { progress: number | null }[]): 'up' | 'down' | 'stable' {
  const validData = data.filter(d => d.progress !== null);
  if (validData.length < 2) return 'stable';
  
  const recent = validData.slice(-2);
  const diff = (recent[1]?.progress || 0) - (recent[0]?.progress || 0);
  
  if (diff > 3) return 'up';
  if (diff < -3) return 'down';
  return 'stable';
}

export function OKRCard({ objective, index }: OKRCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { data: sectors = [] } = useSectors();
  
  const weeklyData = useMemo(() => 
    generateWeeklyProgress(objective.progress, objective.status), 
    [objective.progress, objective.status]
  );

  const trend = useMemo(() => calculateTrend(weeklyData), [weeklyData]);

  const chartColor = useMemo(() => {
    switch (objective.status) {
      case 'on-track': return 'hsl(var(--success))';
      case 'attention': return 'hsl(var(--warning))';
      case 'critical': return 'hsl(var(--critical))';
      default: return 'hsl(var(--primary))';
    }
  }, [objective.status]);

  // Count tasks from keyResults
  const totalTasks = objective.keyResults?.reduce((acc, kr) => acc + (kr.tasks?.length || 0), 0) || 0;
  
  // Find sector label
  const sectorLabel = useMemo(() => {
    const sector = sectors.find(s => s.id === objective.sector || s.name.toLowerCase().replace(/\s+/g, '-') === objective.sector);
    return sector?.name || objective.sector;
  }, [sectors, objective.sector]);

  return (
    <>
      <div 
        className="card-elevated p-5 animate-slide-up cursor-pointer group"
        style={{ animationDelay: `${index * 60}ms` }}
        onClick={() => setIsDetailOpen(true)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
                {sectorLabel}
              </span>
              <StatusBadge status={objective.status} size="sm" />
              
              {/* Trend Indicator */}
              {trend !== 'stable' && (
                <span className={cn(
                  "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
                  trend === 'up' ? "text-success bg-success/10" : "text-critical bg-critical/10"
                )}>
                  {trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-foreground mb-1 truncate group-hover:text-accent transition-colors duration-200">
              {objective.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {objective.description}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
        </div>

        {/* Weekly Progress Chart - Taller */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Evolução Semanal</span>
            <span className="text-xs text-muted-foreground tabular-nums">Semana 4 de 12</span>
          </div>
          <div className="h-16 w-full rounded-lg bg-muted/30 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id={`gradient-${objective.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${objective.id})`}
                  connectNulls={false}
                  dot={false}
                  activeDot={{ r: 4, fill: chartColor, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={objective.progress} status={objective.status} showLabel />

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[80px]">{objective.owner || 'Sem responsável'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{objective.period}</span>
            </div>
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            {objective.keyResults.length} KRs
          </div>
        </div>

        {/* Key Results Preview with visual progress */}
        <div className="mt-4 space-y-2.5">
          {objective.keyResults.slice(0, 2).map((kr) => (
            <div key={kr.id} className="flex items-center gap-3">
              {/* Mini progress bar */}
              <div className="w-12 h-1.5 rounded-full bg-muted/60 overflow-hidden flex-shrink-0">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    kr.status === 'on-track' && "bg-success",
                    kr.status === 'attention' && "bg-warning",
                    kr.status === 'critical' && "bg-critical"
                  )}
                  style={{ width: `${Math.min(kr.progress, 100)}%` }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{kr.title}</p>
              </div>
              <span className={cn(
                "text-xs font-semibold tabular-nums",
                kr.status === 'on-track' && "text-success",
                kr.status === 'attention' && "text-warning",
                kr.status === 'critical' && "text-critical"
              )}>
                {kr.progress}%
              </span>
            </div>
          ))}
          {objective.keyResults.length > 2 && (
            <p className="text-xs text-muted-foreground pl-[60px]">
              +{objective.keyResults.length - 2} mais
              {totalTasks > 0 && ` • ${totalTasks} tarefas`}
            </p>
          )}
        </div>
      </div>
      
      <OKRDetailModal 
        objective={objective} 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
      />
    </>
  );
}
