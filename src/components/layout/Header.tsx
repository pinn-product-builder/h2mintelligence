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

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title, subtitle, breadcrumbs }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border glass flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex flex-col">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={cn(
                  index === breadcrumbs.length - 1 
                    ? "text-foreground font-medium" 
                    : "hover:text-foreground cursor-pointer transition-colors"
                )}>
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
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar OKRs, metas..." 
            className="pl-9 w-64 h-9 bg-background/50 border-border/50 focus:bg-background transition-colors"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full animate-pulse" />
        </Button>

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
