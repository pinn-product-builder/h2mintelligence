import { cn } from '@/lib/utils';
import { OKRStatus } from '@/types/okr';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OKRStatus;
  showIcon?: boolean;
}

const statusConfig: Record<OKRStatus, { label: string; className: string; icon: React.ElementType }> = {
  'on-track': {
    label: 'No Prazo',
    className: 'status-on-track',
    icon: CheckCircle2,
  },
  'attention': {
    label: 'Atenção',
    className: 'status-attention',
    icon: AlertCircle,
  },
  'critical': {
    label: 'Crítico',
    className: 'status-critical',
    icon: XCircle,
  },
};

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn("status-badge", config.className)}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
