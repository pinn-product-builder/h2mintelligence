import { SectorSummary } from '@/types/okr';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface SectorOverviewProps {
  sectors: SectorSummary[];
}

export function SectorOverview({ sectors }: SectorOverviewProps) {
  return (
    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-4">Visão por Setor</h3>
      <div className="space-y-4">
        {sectors.map((sector) => (
          <div key={sector.sector} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm text-foreground group-hover:text-accent transition-colors">
                  {sector.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {sector.onTrack > 0 && (
                    <span className="w-5 h-5 rounded-full bg-success/20 text-success text-[10px] font-medium flex items-center justify-center">
                      {sector.onTrack}
                    </span>
                  )}
                  {sector.attention > 0 && (
                    <span className="w-5 h-5 rounded-full bg-warning/20 text-warning text-[10px] font-medium flex items-center justify-center">
                      {sector.attention}
                    </span>
                  )}
                  {sector.critical > 0 && (
                    <span className="w-5 h-5 rounded-full bg-critical/20 text-critical text-[10px] font-medium flex items-center justify-center">
                      {sector.critical}
                    </span>
                  )}
                </div>
              </div>
              <span className={cn(
                "text-sm font-semibold",
                sector.avgProgress >= 70 && "text-success",
                sector.avgProgress >= 40 && sector.avgProgress < 70 && "text-warning",
                sector.avgProgress < 40 && "text-critical"
              )}>
                {sector.avgProgress}%
              </span>
            </div>
            <ProgressBar 
              progress={sector.avgProgress} 
              status={sector.avgProgress >= 70 ? 'on-track' : sector.avgProgress >= 40 ? 'attention' : 'critical'}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
