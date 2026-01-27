import { TrendingUp, TrendingDown, Target, BarChart3, Package } from 'lucide-react';
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
};

const variantClasses: Record<string, string> = {
  primary: 'gradient-primary',
  accent: 'gradient-accent',
  success: 'gradient-success',
  warning: 'gradient-warning',
};

export function MetricCard({ metric, index }: MetricCardProps) {
  const Icon = iconMap[metric.icon] || TrendingUp;
  const isPositive = metric.change >= 0;

  return (
    <div 
      className={cn(
        "metric-card animate-slide-up",
        variantClasses[metric.variant]
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            isPositive ? "bg-white/20" : "bg-black/10"
          )}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{isPositive ? '+' : ''}{metric.change}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium opacity-80">{metric.title}</p>
          <p className="text-2xl font-bold">{metric.value}</p>
          <p className="text-xs opacity-70">{metric.changeLabel}</p>
        </div>
      </div>
    </div>
  );
}
