import { useState } from 'react';
import { Bell, Search, User, LogOut, Sun, Moon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'OKR "Aumentar faturamento" atingiu 75%', time: 'Há 2 horas', read: false },
  { id: '2', title: 'Checkpoint de Q1 2026 em 2 dias', time: 'Há 5 horas', read: false },
  { id: '3', title: 'Novo ciclo Q2 2026 disponível', time: 'Há 1 dia', read: true },
  { id: '4', title: 'KR "Leads qualificados" atualizado', time: 'Há 2 dias', read: true },
];

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  onSearch?: (term: string) => void;
}

export function Header({ title, subtitle, breadcrumbs, onSearch }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() && onSearch) {
      onSearch(searchValue.trim());
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 border-b border-border glass flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex flex-col">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3 h-3" />}
                <span
                  className={cn(
                    index === breadcrumbs.length - 1 
                      ? "text-foreground font-medium" 
                      : "hover:text-foreground cursor-pointer transition-colors"
                  )}
                  onClick={crumb.href && index < breadcrumbs.length - 1 ? () => window.location.hash = crumb.href! : undefined}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}
        
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <>
              <span className="text-muted-foreground/30">|</span>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar OKRs, metas..." 
            className="pl-9 w-64 h-9 bg-background/50 border-border/50 focus:bg-background transition-colors"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-critical rounded-full text-[10px] font-bold text-critical-foreground flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificações</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline font-normal"
                >
                  Marcar todas como lidas
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                  onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                >
                  <div className="flex items-start gap-2 w-full">
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                    <div className={cn("flex-1", notif.read && "ml-4")}>
                      <p className={cn("text-sm", !notif.read && "font-medium")}>{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Selector */}
        <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
          <SelectTrigger className="w-[100px] h-9 bg-background/50 border-border/50">
            <SelectValue>
              <div className="flex items-center gap-2">
                {theme === 'light' ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="text-sm">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="text-sm">Escuro</span>
                  </>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span>Claro</span>
              </div>
            </SelectItem>
            <SelectItem value="dark">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <span>Escuro</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-accent-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
