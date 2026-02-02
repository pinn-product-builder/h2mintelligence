import { X, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KRPreviewProps {
  krId: string;
  okrId: string;
  krTitle: string;
  okrTitle: string;
  progress?: number;
  status?: 'on-track' | 'attention' | 'critical' | 'completed';
  onClear: () => void;
}

const statusConfig = {
  'on-track': { label: 'No Prazo', className: 'bg-success/10 text-success border-success/20' },
  'attention': { label: 'Atenção', className: 'bg-warning/10 text-warning border-warning/20' },
  'critical': { label: 'Crítico', className: 'bg-critical/10 text-critical border-critical/20' },
  'completed': { label: 'Concluído', className: 'bg-primary/10 text-primary border-primary/20' },
};

export function KRPreview({ 
  krTitle, 
  okrTitle, 
  progress = 0, 
  status = 'on-track',
  onClear 
}: KRPreviewProps) {
  const statusInfo = statusConfig[status];

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* OKR Title */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Target className="w-3 h-3" />
              <span className="truncate">{okrTitle}</span>
            </div>
            
            {/* KR Title */}
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent shrink-0" />
              <span className="font-medium text-sm truncate">{krTitle}</span>
            </div>
            
            {/* Progress and Status */}
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-[120px]">
                <Progress value={progress} className="h-1.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {progress.toFixed(0)}%
              </span>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
          
          {/* Clear Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={onClear}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
