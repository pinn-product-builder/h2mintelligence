import { SectorSummary } from '@/types/okr';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';
import { Building2, ChevronRight } from 'lucide-react';

interface SectorOverviewProps {
  sectors: SectorSummary[];
}

export function SectorOverview({ sectors }: SectorOverviewProps) {
  if (sectors.length === 0) {
    return (
      <div className="card-elevated p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Visão por Setor</h3>
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="empty-state py-8">
          <div className="empty-state-icon w-12 h-12">
            <Building2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="empty-state-description text-sm">
            Nenhum setor com OKRs ativos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Visão por Setor</h3>
        <Building2 className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {sectors.map((sector, index) => (
          <SectorRow key={sector.sector} sector={sector} index={index} />
        ))}
      </div>
    </div>
  );
}

interface SectorRowProps {
  sector: SectorSummary;
  index: number;
}

function SectorRow({ sector, index }: SectorRowProps) {
  const status = sector.avgProgress >= 70 ? 'on-track' : sector.avgProgress >= 40 ? 'attention' : 'critical';
  
  return (
    <div 
      className="group cursor-pointer p-3 -mx-3 rounded-lg hover:bg-muted/40 transition-all duration-200"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="font-medium text-sm text-foreground group-hover:text-accent transition-colors truncate">
            {sector.label}
          </span>
          
          {/* Status indicators */}
          <div className="flex items-center gap-1">
            {sector.onTrack > 0 && (
              <StatusPill count={sector.onTrack} variant="success" />
            )}
            {sector.attention > 0 && (
              <StatusPill count={sector.attention} variant="warning" />
            )}
            {sector.critical > 0 && (
              <StatusPill count={sector.critical} variant="critical" />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-bold tabular-nums",
            sector.avgProgress >= 70 && "text-success",
            sector.avgProgress >= 40 && sector.avgProgress < 70 && "text-warning",
            sector.avgProgress < 40 && "text-critical"
          )}>
            {sector.avgProgress}%
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
      
      <ProgressBar 
        progress={sector.avgProgress} 
        status={status}
        size="sm"
      />
      
      <p className="text-xs text-muted-foreground mt-1.5">
        {sector.totalOKRs} OKR{sector.totalOKRs !== 1 ? 's' : ''} neste setor
      </p>
    </div>
  );
}

interface StatusPillProps {
  count: number;
  variant: 'success' | 'warning' | 'critical';
}

function StatusPill({ count, variant }: StatusPillProps) {
  const variantClasses = {
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    critical: 'bg-critical/20 text-critical border-critical/30',
  };

  return (
    <span className={cn(
      "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border",
      variantClasses[variant]
    )}>
      {count}
    </span>
  );
}
