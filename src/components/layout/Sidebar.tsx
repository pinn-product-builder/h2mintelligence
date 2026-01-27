import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  Building2, 
  Settings, 
  Users,
  TrendingUp,
  Package,
  Megaphone,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Boxes
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'okrs', label: 'OKRs', icon: Target },
  { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
];

const sectorItems = [
  { id: 'comercial', label: 'Comercial', icon: TrendingUp },
  { id: 'financeiro', label: 'Financeiro', icon: Briefcase },
  { id: 'compras', label: 'Compras', icon: Package },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'operacoes', label: 'Operações', icon: Boxes },
];

const systemItems = [
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sidebar-foreground text-sm">H2M Intelligence</span>
            <span className="text-[10px] text-sidebar-foreground/60">OKRs & Metas</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Navigation */}
        <div className="mb-6">
          {!collapsed && <p className="section-title px-3 text-sidebar-foreground/50">Principal</p>}
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "sidebar-item w-full",
                    currentSection === item.id && "sidebar-item-active"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sectors */}
        <div className="mb-6">
          {!collapsed && <p className="section-title px-3 text-sidebar-foreground/50">Setores</p>}
          <ul className="space-y-1">
            {sectorItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "sidebar-item w-full",
                    currentSection === item.id && "sidebar-item-active"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* System */}
        <div>
          {!collapsed && <p className="section-title px-3 text-sidebar-foreground/50">Sistema</p>}
          <ul className="space-y-1">
            {systemItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "sidebar-item w-full",
                    currentSection === item.id && "sidebar-item-active"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
