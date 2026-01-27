import { cn } from '@/lib/utils';
import { OKRStatus } from '@/types/okr';

interface ProgressBarProps {
  progress: number;
  status: OKRStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusColors: Record<OKRStatus, string> = {
  'on-track': 'gradient-success',
  'attention': 'gradient-warning',
  'critical': 'gradient-critical',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({ progress, status, size = 'md', showLabel = false }: ProgressBarProps) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Progresso</span>
          <span className="text-xs font-medium">{progress}%</span>
        </div>
      )}
      <div className={cn("progress-bar", sizeClasses[size])}>
        <div 
          className={cn("progress-bar-fill", statusColors[status])}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
