import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  Settings, 
  Users,
  ChevronLeft,
  ChevronRight,
  Database,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'okrs', label: 'OKRs', icon: Target },
  { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
  { id: 'datasource', label: 'Data Source', icon: Database },
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
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50",
        "transition-all duration-300 ease-out",
        "shadow-xl",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 h-16 border-b border-sidebar-border",
        collapsed ? "px-5 justify-center" : "px-5"
      )}>
        <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0 shadow-md">
          <Building2 className="w-5 h-5 text-sidebar-primary-foreground" strokeWidth={2} />
        </div>
        <div className={cn(
          "flex flex-col overflow-hidden transition-all duration-300",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}>
          <span className="font-bold text-sidebar-foreground text-sm whitespace-nowrap">H2M Intelligence</span>
          <span className="text-[10px] text-sidebar-foreground/60 whitespace-nowrap">OKRs & Metas</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        {/* Main Navigation */}
        <div className="mb-6">
          {!collapsed && (
            <p className="section-title px-3 text-sidebar-foreground/50 mb-2">Principal</p>
          )}
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "sidebar-item w-full",
                    currentSection === item.id && "sidebar-item-active",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                  <span className={cn(
                    "transition-all duration-300 whitespace-nowrap",
                    collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                  )}>
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* System */}
        <div>
          {!collapsed && (
            <p className="section-title px-3 text-sidebar-foreground/50 mb-2">Sistema</p>
          )}
          <ul className="space-y-1">
            {systemItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "sidebar-item w-full",
                    currentSection === item.id && "sidebar-item-active",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                  <span className={cn(
                    "transition-all duration-300 whitespace-nowrap",
                    collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                  )}>
                    {item.label}
                  </span>
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
          className={cn(
            "sidebar-item w-full group",
            collapsed ? "justify-center px-0" : "justify-between"
          )}
        >
          {!collapsed && <span>Recolher</span>}
          <div className={cn(
            "w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center",
            "transition-transform duration-300",
            collapsed && "rotate-180"
          )}>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>
      </div>
    </aside>
  );
}
