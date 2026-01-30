import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'title' | 'avatar' | 'card' | 'button';
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variantClasses = {
    default: '',
    text: 'h-4 rounded',
    title: 'h-6 rounded w-3/4',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-32 rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <div 
      className={cn(
        "animate-pulse bg-muted rounded-md relative overflow-hidden",
        variantClasses[variant],
        className
      )} 
      {...props}
    >
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}

// Skeleton Components for specific use cases
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-elevated p-5 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton variant="avatar" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

function SkeletonMetricCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl p-5 bg-muted/50", className)}>
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="avatar" className="rounded-xl" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton className="h-8 w-20" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-3 bg-muted/30 rounded-lg">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-border/50">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("card-elevated p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="title" className="w-1/3" />
        <Skeleton variant="avatar" className="w-6 h-6" />
      </div>
      <div className="h-60 flex items-end gap-2 pt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t-md" 
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonMetricCard, 
  SkeletonTable, 
  SkeletonChart 
};
