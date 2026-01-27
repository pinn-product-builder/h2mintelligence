import { Objective } from '@/types/okr';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { sectorLabels } from '@/data/mockData';
import { ChevronRight, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OKRCardProps {
  objective: Objective;
  index: number;
}

export function OKRCard({ objective, index }: OKRCardProps) {
  return (
    <div 
      className="card-elevated p-5 animate-slide-up cursor-pointer group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
              {sectorLabels[objective.sector]}
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
          </p>
        )}
      </div>
    </div>
  );
}
