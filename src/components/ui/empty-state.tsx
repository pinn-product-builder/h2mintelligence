import { Target, FileText, BarChart3, Inbox, Database, Users, FolderOpen, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'default' | 'okr' | 'data' | 'chart' | 'table' | 'users' | 'files';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, { 
  icon: LucideIcon; 
  defaultTitle: string; 
  defaultDescription: string;
  iconBg: string;
  iconColor: string;
}> = {
  default: {
    icon: Inbox,
    defaultTitle: 'Nenhum item encontrado',
    defaultDescription: 'Não há dados para exibir no momento.',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  okr: {
    icon: Target,
    defaultTitle: 'Nenhum OKR cadastrado',
    defaultDescription: 'Crie seu primeiro objetivo para começar a acompanhar suas metas.',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  data: {
    icon: Database,
    defaultTitle: 'Nenhum dado importado',
    defaultDescription: 'Importe dados de arquivos CSV ou Excel para começar.',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  chart: {
    icon: BarChart3,
    defaultTitle: 'Dados insuficientes',
    defaultDescription: 'Adicione mais dados para visualizar os gráficos.',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
  table: {
    icon: FileText,
    defaultTitle: 'Tabela vazia',
    defaultDescription: 'Nenhum registro para exibir.',
    iconBg: 'bg-secondary',
    iconColor: 'text-secondary-foreground',
  },
  users: {
    icon: Users,
    defaultTitle: 'Nenhum usuário encontrado',
    defaultDescription: 'Convide membros da equipe para colaborar.',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  files: {
    icon: FolderOpen,
    defaultTitle: 'Nenhum arquivo',
    defaultDescription: 'Faça upload de arquivos para começar.',
    iconBg: 'bg-critical/10',
    iconColor: 'text-critical',
  },
};

export function EmptyState({ 
  variant = 'default', 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn("empty-state animate-fade-in", className)}>
      {/* Icon Container */}
      <div className={cn(
        "empty-state-icon w-16 h-16",
        config.iconBg
      )}>
        <Icon className={cn("w-7 h-7", config.iconColor)} strokeWidth={1.5} />
      </div>

      {/* Text Content */}
      <h3 className="empty-state-title">
        {title || config.defaultTitle}
      </h3>
      <p className="empty-state-description">
        {description || config.defaultDescription}
      </p>

      {/* Action Button */}
      {action && (
        <Button 
          onClick={action.onClick}
          className="mt-4 gradient-accent text-accent-foreground"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
