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
                Importação de Planilhas
              </CardTitle>
              <CardDescription>Configure a importação de dados via arquivos CSV/Excel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium">Sistema Configurado</p>
                    <p className="text-sm text-muted-foreground">Última importação: 28/01/2026 às 09:15</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-success border-success">Ativo</Badge>
              </div>
              
              <div className="space-y-2">
                <Label>Formato de Data Padrão</Label>
                <Select defaultValue="dd-mm-yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM/DD/AAAA</SelectItem>
                    <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Separador de CSV</Label>
                <Select defaultValue="semicolon">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semicolon">Ponto e vírgula (;)</SelectItem>
                    <SelectItem value="comma">Vírgula (,)</SelectItem>
                    <SelectItem value="tab">Tabulação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Codificação de Arquivo</Label>
                <Select defaultValue="utf8">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utf8">UTF-8</SelectItem>
                    <SelectItem value="latin1">ISO-8859-1 (Latin-1)</SelectItem>
                    <SelectItem value="windows">Windows-1252</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="gradient-accent text-accent-foreground border-0">Salvar Configurações</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Templates de Importação</CardTitle>
              <CardDescription>Baixe os modelos padronizados para cada tipo de dado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {['Faturamento', 'Custos Operacionais', 'Estoque', 'Metas OKR', 'Leads Marketing'].map((template) => (
                  <Button key={template} variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <div className="font-medium">{template}</div>
                      <div className="text-xs text-muted-foreground">template_{template.toLowerCase().replace(' ', '_')}.xlsx</div>
                    </div>
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Use estes templates para garantir que seus dados sejam importados corretamente.
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
