import { useState } from 'react';
import { Objective } from '@/types/okr';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { useSectors } from '@/hooks/useSupabaseData';
import { ChevronRight, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
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

export function OKRCard({ objective, index }: OKRCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { data: sectors = [] } = useSectors();
  
  const weeklyData = useMemo(() => 
    generateWeeklyProgress(objective.progress, objective.status), 
    [objective.progress, objective.status]
  );

  const chartColor = useMemo(() => {
    switch (objective.status) {
      case 'on-track': return 'hsl(var(--status-success))';
      case 'attention': return 'hsl(var(--status-warning))';
      case 'critical': return 'hsl(var(--status-critical))';
      default: return 'hsl(var(--primary))';
    }
  }, [objective.status]);

  // Count tasks from keyResults
  const totalTasks = objective.keyResults?.reduce((acc, kr) => acc + (kr.tasks?.length || 0), 0) || 0;
  
  // Find sector label - support both slug (old format) and id (new format)
  const sectorLabel = useMemo(() => {
    const sector = sectors.find(s => s.id === objective.sector || s.name.toLowerCase().replace(/\s+/g, '-') === objective.sector);
    return sector?.name || objective.sector;
  }, [sectors, objective.sector]);

  return (
    <>
    <div 
      className="card-elevated p-5 animate-slide-up cursor-pointer group"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setIsDetailOpen(true)}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
              {sectorLabel}
            </span>
            <StatusBadge status={objective.status} />
          </div>
          <h3 className="font-semibold text-foreground mb-1 truncate group-hover:text-accent transition-colors">
            {objective.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {objective.description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
      </div>

      {/* Weekly Progress Chart */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Evolução Semanal</span>
          <span className="text-xs text-muted-foreground">Semana 4 de 12</span>
        </div>
        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <defs>
                <linearGradient id={`gradient-${objective.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
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
                activeDot={{ r: 3, fill: chartColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ProgressBar progress={objective.progress} status={objective.status} showLabel />

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{objective.owner}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{objective.period}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {objective.keyResults.length} Key Results
        </div>
      </div>

      {/* Key Results Preview */}
      <div className="mt-4 space-y-2">
        {objective.keyResults.slice(0, 2).map((kr) => (
          <div key={kr.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{kr.title}</p>
            </div>
            <span className={cn(
              "text-xs font-medium",
              kr.status === 'on-track' && "text-success",
              kr.status === 'attention' && "text-warning",
              kr.status === 'critical' && "text-critical"
            )}>
              {kr.progress}%
            </span>
          </div>
        ))}
        {objective.keyResults.length > 2 && (
          <p className="text-xs text-muted-foreground">
            +{objective.keyResults.length - 2} mais
            {totalTasks > 0 && ` (${totalTasks} Tarefas)`}
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
