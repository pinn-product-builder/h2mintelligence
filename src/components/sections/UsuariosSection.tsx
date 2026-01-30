import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Search, Shield, User, Eye, Edit, Check, Users, Loader2 } from 'lucide-react';
import { ROLE_CONFIGS, AppRole, getRoleConfig } from '@/types/user';
import { useUsersWithRoles, useCreateUser, useUpdateUserRole, UserWithRole } from '@/hooks/useUsers';
import { useSectors } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const perfilIcons: Record<AppRole, React.ReactNode> = {
  admin: <Shield className="w-3 h-3" />,
  gestor: <Edit className="w-3 h-3" />,
  analista: <User className="w-3 h-3" />,
  visualizador: <Eye className="w-3 h-3" />,
};

const perfilColors: Record<AppRole, string> = {
  admin: 'bg-primary text-primary-foreground',
  gestor: 'bg-accent text-accent-foreground',
  analista: 'bg-muted text-muted-foreground',
  visualizador: 'bg-muted/50 text-muted-foreground',
};

export function UsuariosSection() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useUsersWithRoles();
  const { data: sectors = [] } = useSectors();
  const createUserMutation = useCreateUser();
  const updateRoleMutation = useUpdateUserRole();

  const [searchTerm, setSearchTerm] = useState('');
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('analista');

  const isAdmin = currentUser?.role === 'admin';

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUsersByRole = (role: AppRole) => users.filter(u => u.role === role);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (!isAdmin) return;
    await updateRoleMutation.mutateAsync({ userId, newRole });
  };

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      return;
    }

    await createUserMutation.mutateAsync({
      email: newUserEmail,
      password: newUserPassword,
      name: newUserName,
      role: newUserRole,
    });

    setNewUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('analista');
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="card-elevated">
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total de Usuários</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{users.length}</p>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{users.filter(u => u.role === 'admin').length}</p>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{users.filter(u => u.role === 'gestor').length}</p>
            <p className="text-sm text-muted-foreground">Gestores</p>
          </CardContent>
        </Card>
      </div>

      {/* Group Management Board */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Quadro de Grupos
          </CardTitle>
          <CardDescription>
            Visualize e gerencie usuários por grupo de permissão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {ROLE_CONFIGS.map((roleConfig) => {
              const roleUsers = getUsersByRole(roleConfig.role);
              return (
                <div
                  key={roleConfig.role}
                  className="border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`gap-1 ${perfilColors[roleConfig.role]}`}>
                      {perfilIcons[roleConfig.role]}
                      {roleConfig.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                    {roleUsers.length > 0 ? (
                      roleUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="truncate flex-1">{user.name.split(' ')[0]}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum usuário
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                    {roleUsers.length} usuário{roleUsers.length !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar usuários..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isAdmin && (
          <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-accent text-accent-foreground border-0">
                <Plus className="w-4 h-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                <DialogDescription>Preencha os dados do novo usuário. Um email de boas-vindas será enviado.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Ex: joao.silva@h2m.com.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha Inicial</Label>
                  <Input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Perfil de Acesso</Label>
                  <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_CONFIGS.map((config) => (
                        <SelectItem key={config.role} value={config.role}>
                          <div className="flex items-center gap-2">
                            {perfilIcons[config.role]}
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setNewUserOpen(false)}>Cancelar</Button>
                  <Button 
                    onClick={handleAddUser} 
                    className="gradient-accent"
                    disabled={createUserMutation.isPending || !newUserName || !newUserEmail || !newUserPassword}
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Adicionar'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabela */}
      <Card className="card-elevated">
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum usuário encontrado"
              description={searchTerm ? "Tente buscar por outro termo" : "Adicione o primeiro usuário do sistema"}
              action={isAdmin ? (
                <Button onClick={() => setNewUserOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Usuário
                </Button>
              ) : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.user_id, value as AppRole)}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue>
                              <Badge className={`gap-1 ${perfilColors[user.role]}`}>
                                {perfilIcons[user.role]}
                                {getRoleConfig(user.role).label}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_CONFIGS.map((config) => (
                              <SelectItem key={config.role} value={config.role}>
                                <div className="flex items-center gap-2">
                                  {perfilIcons[config.role]}
                                  {config.label}
                                  {user.role === config.role && <Check className="w-4 h-4 ml-auto" />}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`gap-1 ${perfilColors[user.role]}`}>
                          {perfilIcons[user.role]}
                          {getRoleConfig(user.role).label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(user.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Legenda de Perfis */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">Níveis de Permissão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {ROLE_CONFIGS.map((config) => (
              <div key={config.role} className="p-3 rounded-lg border border-border">
                <Badge className={`gap-1 mb-2 ${perfilColors[config.role]}`}>
                  {perfilIcons[config.role]}
                  {config.label}
                </Badge>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
