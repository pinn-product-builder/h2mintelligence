import { Target, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { mockObjectives } from '@/data/mockData';

export function QuickStats() {
  const totalOKRs = mockObjectives.length;
  const onTrack = mockObjectives.filter(o => o.status === 'on-track').length;
  const attention = mockObjectives.filter(o => o.status === 'attention').length;
  const critical = mockObjectives.filter(o => o.status === 'critical').length;
  const avgProgress = Math.round(
    mockObjectives.reduce((sum, o) => sum + o.progress, 0) / totalOKRs
  );

  return (
    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-4">Resumo Q1 2026</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-2xl font-bold text-foreground">{totalOKRs}</span>
          </div>
          <p className="text-xs text-muted-foreground">Total OKRs</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <span className="text-2xl font-bold text-accent">{avgProgress}%</span>
          <p className="text-xs text-muted-foreground">Média Geral</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-sm text-foreground">No Prazo</span>
          </div>
          <span className="font-semibold text-success">{onTrack}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm text-foreground">Atenção</span>
          </div>
          <span className="font-semibold text-warning">{attention}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-critical" />
            <span className="text-sm text-foreground">Crítico</span>
          </div>
          <span className="font-semibold text-critical">{critical}</span>
        </div>
      </div>
    </div>
  );
}
