import { cn } from '@/lib/utils';
import { OKRStatus } from '@/types/okr';
import { CheckCircle2, AlertCircle, XCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: OKRStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
}

const statusConfig: Record<OKRStatus, { 
  label: string; 
  className: string; 
  solidClassName: string;
  icon: React.ElementType 
}> = {
  'on-track': {
    label: 'No Prazo',
    className: 'status-on-track',
    solidClassName: 'bg-success text-success-foreground',
    icon: CheckCircle2,
  },
  'attention': {
    label: 'Atenção',
    className: 'status-attention',
    solidClassName: 'bg-warning text-warning-foreground',
    icon: AlertCircle,
  },
  'critical': {
    label: 'Crítico',
    className: 'status-critical',
    solidClassName: 'bg-critical text-critical-foreground',
    icon: XCircle,
  },
  'completed': {
    label: 'Concluído',
    className: 'status-on-track',
    solidClassName: 'bg-success text-success-foreground',
    icon: CheckCircle2,
  },
};

const sizeConfig = {
  sm: {
    badge: "text-[10px] px-1.5 py-0.5 gap-1",
    icon: "w-3 h-3"
  },
  md: {
    badge: "text-xs px-2.5 py-1 gap-1.5",
    icon: "w-3.5 h-3.5"
  },
  lg: {
    badge: "text-sm px-3 py-1.5 gap-2",
    icon: "w-4 h-4"
  }
};

export function StatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  variant = 'default'
}: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig['on-track'];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  const baseClasses = "status-badge transition-all duration-200";
  
  const variantClasses = variant === 'solid' 
    ? config.solidClassName 
    : config.className;

  return (
    <span className={cn(
      baseClasses,
      variantClasses,
      sizeStyles.badge
    )}>
      {showIcon && <Icon className={sizeStyles.icon} strokeWidth={2.5} />}
      {config.label}
    </span>
  );
}
