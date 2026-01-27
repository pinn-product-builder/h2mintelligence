import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, MoreHorizontal, Shield, User, Eye, Edit } from 'lucide-react';

const mockUsers = [
  { id: 1, nome: 'Carlos Silva', email: 'carlos.silva@h2m.com.br', setor: 'Comercial', perfil: 'Admin', status: 'Ativo', ultimoAcesso: '27/01/2026 14:32' },
  { id: 2, nome: 'Roberto Mendes', email: 'roberto.mendes@h2m.com.br', setor: 'Financeiro', perfil: 'Gestor', status: 'Ativo', ultimoAcesso: '27/01/2026 11:15' },
  { id: 3, nome: 'Fernanda Alves', email: 'fernanda.alves@h2m.com.br', setor: 'Compras', perfil: 'Gestor', status: 'Ativo', ultimoAcesso: '27/01/2026 09:45' },
  { id: 4, nome: 'Bruno Martins', email: 'bruno.martins@h2m.com.br', setor: 'Marketing', perfil: 'Gestor', status: 'Ativo', ultimoAcesso: '26/01/2026 18:20' },
  { id: 5, nome: 'André Souza', email: 'andre.souza@h2m.com.br', setor: 'Operações', perfil: 'Gestor', status: 'Ativo', ultimoAcesso: '27/01/2026 10:00' },
  { id: 6, nome: 'Ana Costa', email: 'ana.costa@h2m.com.br', setor: 'Comercial', perfil: 'Analista', status: 'Ativo', ultimoAcesso: '27/01/2026 13:55' },
  { id: 7, nome: 'Pedro Santos', email: 'pedro.santos@h2m.com.br', setor: 'Comercial', perfil: 'Analista', status: 'Ativo', ultimoAcesso: '27/01/2026 12:30' },
  { id: 8, nome: 'Maria Lima', email: 'maria.lima@h2m.com.br', setor: 'Comercial', perfil: 'Visualizador', status: 'Inativo', ultimoAcesso: '15/01/2026 16:00' },
];

const perfilIcons: Record<string, React.ReactNode> = {
  Admin: <Shield className="w-3 h-3" />,
  Gestor: <Edit className="w-3 h-3" />,
  Analista: <User className="w-3 h-3" />,
  Visualizador: <Eye className="w-3 h-3" />,
};

const perfilColors: Record<string, string> = {
  Admin: 'bg-primary text-primary-foreground',
  Gestor: 'bg-accent text-accent-foreground',
  Analista: 'bg-muted text-muted-foreground',
  Visualizador: 'bg-muted/50 text-muted-foreground',
};

export function UsuariosSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockUsers.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{mockUsers.length}</p>
            <p className="text-sm text-muted-foreground">Total de Usuários</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{mockUsers.filter(u => u.status === 'Ativo').length}</p>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{mockUsers.filter(u => u.perfil === 'Admin').length}</p>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{mockUsers.filter(u => u.perfil === 'Gestor').length}</p>
            <p className="text-sm text-muted-foreground">Gestores</p>
          </CardContent>
        </Card>
      </div>

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
        <Button className="gap-2 gradient-accent text-accent-foreground border-0">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Tabela */}
      <Card className="card-elevated">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {user.nome.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.nome}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.setor}</TableCell>
                  <TableCell>
                    <Badge className={`gap-1 ${perfilColors[user.perfil]}`}>
                      {perfilIcons[user.perfil]}
                      {user.perfil}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Ativo' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.ultimoAcesso}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legenda de Perfis */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">Níveis de Permissão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { perfil: 'Admin', desc: 'Acesso total ao sistema, gestão de usuários e configurações' },
              { perfil: 'Gestor', desc: 'Gerencia OKRs do setor, edita KRs e acompanha indicadores' },
              { perfil: 'Analista', desc: 'Atualiza progresso de KRs e adiciona observações' },
              { perfil: 'Visualizador', desc: 'Apenas visualização de dashboards e relatórios' },
            ].map((item) => (
              <div key={item.perfil} className="p-3 rounded-lg border border-border">
                <Badge className={`gap-1 mb-2 ${perfilColors[item.perfil]}`}>
                  {perfilIcons[item.perfil]}
                  {item.perfil}
                </Badge>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
