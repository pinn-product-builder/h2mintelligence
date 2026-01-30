import { TrendingUp, TrendingDown, Target, BarChart3, Package, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard as MetricCardType } from '@/types/okr';

interface MetricCardProps {
  metric: MetricCardType;
  index: number;
}

const iconMap: Record<string, React.ElementType> = {
  'trending-up': TrendingUp,
  'target': Target,
  'bar-chart': BarChart3,
  'package': Package,
  'check-circle': CheckCircle,
  'clock': Clock,
  'alert-triangle': AlertTriangle,
};

const variantConfig: Record<string, { gradient: string; iconBg: string }> = {
  primary: { 
    gradient: 'gradient-primary',
    iconBg: 'bg-white/20'
  },
  accent: { 
    gradient: 'gradient-accent',
    iconBg: 'bg-white/20'
  },
  success: { 
    gradient: 'gradient-success',
    iconBg: 'bg-white/25'
  },
  warning: { 
    gradient: 'gradient-warning',
    iconBg: 'bg-white/20'
  },
  critical: { 
    gradient: 'gradient-critical',
    iconBg: 'bg-white/20'
  },
};

export function MetricCard({ metric, index }: MetricCardProps) {
  const Icon = iconMap[metric.icon] || Target;
  const isPositive = metric.change >= 0;
  const config = variantConfig[metric.variant] || variantConfig.primary;

  return (
    <div 
      className={cn(
        "metric-card animate-slide-up",
        config.gradient
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            config.iconBg
          )}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm",
            isPositive 
              ? "bg-white/25 text-white" 
              : "bg-black/15 text-white/90"
          )}>
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
            )}
            <span className="tabular-nums">{isPositive ? '+' : ''}{metric.change}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-white/80">{metric.title}</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">{metric.value}</p>
          <p className="text-xs text-white/60">{metric.changeLabel}</p>
        </div>

        {/* Subtle sparkline hint */}
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,20 Q25,15 50,18 T100,12 T150,16 T200,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
