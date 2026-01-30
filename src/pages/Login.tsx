import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Loader2, Eye, EyeOff, Target, BarChart3, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Login() {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    const result = await signup(email, password, name);
    
    if (!result.success) {
      setError(result.error || 'Erro ao criar conta');
    } else {
      setSuccess('Conta criada! Verifique seu email para confirmar.');
      setActiveTab('login');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl">H2M Intelligence</h1>
              <p className="text-sm text-white/70">Sistema de Gestão OKRs</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold leading-tight">
              Transforme sua estratégia em resultados mensuráveis
            </h2>
            <div className="space-y-4">
              <FeatureItem 
                icon={Target} 
                title="OKRs Inteligentes" 
                description="Defina e acompanhe objetivos com precisão"
              />
              <FeatureItem 
                icon={BarChart3} 
                title="Indicadores em Tempo Real" 
                description="Dashboards e métricas atualizados automaticamente"
              />
              <FeatureItem 
                icon={Users} 
                title="Colaboração Efetiva" 
                description="Engaje toda a equipe no alcance das metas"
              />
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-white/50">
            © 2026 H2M Intelligence. Todos os direitos reservados.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-20 -right-10 w-60 h-60 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-accent-foreground" />
            </div>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle className="text-2xl font-bold">
                {activeTab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'login' 
                  ? 'Entre com suas credenciais para acessar' 
                  : 'Preencha os dados para começar'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="animate-fade-in">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <AlertMessage error={error} success={success} />

                    <Button 
                      type="submit" 
                      className="w-full h-11 gradient-accent text-accent-foreground font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="animate-fade-in">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">Nome completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Senha</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          disabled={isLoading}
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <AlertMessage error={error} success={success} />

                    <Button 
                      type="submit" 
                      className="w-full h-11 gradient-accent text-accent-foreground font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar Conta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Mobile Footer */}
          <p className="lg:hidden text-xs text-center text-muted-foreground mt-6">
            © 2026 H2M Intelligence. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  );
}

interface AlertMessageProps {
  error: string;
  success: string;
}

function AlertMessage({ error, success }: AlertMessageProps) {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm animate-fade-in">
          {success}
        </div>
      )}
    </>
  );
}
