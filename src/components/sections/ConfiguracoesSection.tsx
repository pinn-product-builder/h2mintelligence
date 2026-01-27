import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Database, Bell, Shield, Palette, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function ConfiguracoesSection() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="integracao">Integração</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>Dados gerais da organização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input defaultValue="H2M Embalagens" />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input defaultValue="12.345.678/0001-90" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ciclo de OKRs Padrão</Label>
                <Select defaultValue="trimestral">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select defaultValue="america-sao-paulo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-sao-paulo">América/São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="america-manaus">América/Manaus (GMT-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="gradient-accent text-accent-foreground border-0">Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracao" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-5 h-5" />
                ERP Sankhya
              </CardTitle>
              <CardDescription>Integração com o sistema ERP para importação de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium">Conexão Ativa</p>
                    <p className="text-sm text-muted-foreground">Última sincronização: 27/01/2026 às 06:00</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-success border-success">Conectado</Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL do Servidor</Label>
                  <Input defaultValue="https://erp.h2m.com.br/api" type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Token de Acesso</Label>
                  <Input defaultValue="sk_live_xxxxxxxxxxxxx" type="password" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Frequência de Sincronização</Label>
                <Select defaultValue="diaria">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tempo-real">Tempo Real</SelectItem>
                    <SelectItem value="horaria">A cada hora</SelectItem>
                    <SelectItem value="diaria">Diária (06:00)</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Sincronizar Agora
                </Button>
                <Button variant="outline">Testar Conexão</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Importação Manual (Fallback)</CardTitle>
              <CardDescription>Importar dados via arquivo quando a integração estiver indisponível</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-2">Arraste um arquivo CSV/Excel ou clique para selecionar</p>
                <Button variant="outline">Selecionar Arquivo</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Formatos aceitos: .csv, .xlsx, .xls (máx. 10MB)
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'OKR atinge status crítico', desc: 'Quando um OKR fica abaixo de 30% do esperado', default: true },
                { label: 'Checkpoint próximo', desc: 'Lembrete 2 dias antes de um checkpoint agendado', default: true },
                { label: 'Novo ciclo de OKRs', desc: 'Quando um novo ciclo trimestral começa', default: true },
                { label: 'Atualização de KR', desc: 'Quando um Key Result é atualizado por outro usuário', default: false },
                { label: 'Relatório semanal', desc: 'Resumo semanal do progresso dos OKRs', default: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Políticas de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação de dois fatores (2FA)</p>
                  <p className="text-sm text-muted-foreground">Exigir 2FA para todos os usuários</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Expiração de sessão</p>
                  <p className="text-sm text-muted-foreground">Deslogar após período de inatividade</p>
                </div>
                <Select defaultValue="8h">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="4h">4 horas</SelectItem>
                    <SelectItem value="8h">8 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auditoria de ações</p>
                  <p className="text-sm text-muted-foreground">Registrar todas as alterações em OKRs</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Retenção de logs</p>
                  <p className="text-sm text-muted-foreground">Período de armazenamento dos logs de auditoria</p>
                </div>
                <Select defaultValue="1ano">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3meses">3 meses</SelectItem>
                    <SelectItem value="6meses">6 meses</SelectItem>
                    <SelectItem value="1ano">1 ano</SelectItem>
                    <SelectItem value="2anos">2 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Personalização Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex gap-3">
                  {['Claro', 'Escuro', 'Sistema'].map((tema) => (
                    <Button 
                      key={tema} 
                      variant={tema === 'Claro' ? 'default' : 'outline'}
                      className={tema === 'Claro' ? 'gradient-accent text-accent-foreground border-0' : ''}
                    >
                      {tema}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cor de Destaque</Label>
                <div className="flex gap-2">
                  {['hsl(174, 60%, 40%)', 'hsl(220, 70%, 50%)', 'hsl(280, 60%, 50%)', 'hsl(340, 70%, 50%)'].map((cor, i) => (
                    <button 
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 ${i === 0 ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Animações</p>
                  <p className="text-sm text-muted-foreground">Ativar animações e transições</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modo compacto</p>
                  <p className="text-sm text-muted-foreground">Reduzir espaçamentos para mais informações na tela</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
