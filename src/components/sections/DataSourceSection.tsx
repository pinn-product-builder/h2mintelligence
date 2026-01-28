import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  FileSpreadsheet, 
  RefreshCw, 
  Plus, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Trash2,
  Edit,
  Table as TableIcon,
  Download
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'manual';
  status: 'connected' | 'error' | 'pending';
  lastSync: string;
  records: number;
  tables: string[];
}

interface DataMapping {
  id: string;
  sourceField: string;
  targetMetric: string;
  transformation: string;
  status: 'active' | 'inactive';
}

const mockDataSources: DataSource[] = [
  {
    id: '1',
    name: 'Planilha Faturamento',
    type: 'csv',
    status: 'connected',
    lastSync: '2026-01-28 09:15',
    records: 1250,
    tables: ['Faturamento Mensal'],
  },
  {
    id: '2',
    name: 'Planilha Custos Operacionais',
    type: 'csv',
    status: 'connected',
    lastSync: '2026-01-27 14:00',
    records: 890,
    tables: ['Custos', 'DRE'],
  },
  {
    id: '3',
    name: 'Planilha Estoque',
    type: 'csv',
    status: 'connected',
    lastSync: '2026-01-28 08:00',
    records: 3420,
    tables: ['Giro de Estoque', 'Curva ABC'],
  },
  {
    id: '4',
    name: 'Planilha Leads Marketing',
    type: 'csv',
    status: 'pending',
    lastSync: '2026-01-25 16:30',
    records: 520,
    tables: ['Leads', 'Campanhas'],
  },
  {
    id: '5',
    name: 'Entrada Manual - Metas',
    type: 'manual',
    status: 'connected',
    lastSync: '2026-01-27 16:45',
    records: 85,
    tables: ['Metas por Setor'],
  },
];

const mockMappings: DataMapping[] = [
  { id: '1', sourceField: 'faturamento.valor_total', targetMetric: 'Faturamento Mensal', transformation: 'SUM', status: 'active' },
  { id: '2', sourceField: 'custos.valor', targetMetric: 'Custos Operacionais', transformation: 'SUM', status: 'active' },
  { id: '3', sourceField: 'estoque.quantidade', targetMetric: 'Giro de Estoque', transformation: 'AVG', status: 'active' },
  { id: '4', sourceField: 'dre.margem', targetMetric: 'Margem EBITDA', transformation: 'AVG', status: 'active' },
  { id: '5', sourceField: 'leads.qualificados', targetMetric: 'Leads Qualificados', transformation: 'COUNT', status: 'active' },
];

const mockImportHistory = [
  { id: '1', source: 'Planilha Faturamento', date: '2026-01-28 09:15', records: 125, status: 'success', user: 'Carlos Silva' },
  { id: '2', source: 'Planilha Custos Operacionais', date: '2026-01-27 14:00', records: 89, status: 'success', user: 'Roberto Mendes' },
  { id: '3', source: 'Planilha Estoque', date: '2026-01-28 08:00', records: 342, status: 'success', user: 'Fernanda Alves' },
  { id: '4', source: 'Planilha Leads Marketing', date: '2026-01-25 16:30', records: 52, status: 'success', user: 'Bruno Martins' },
  { id: '5', source: 'Entrada Manual - Metas', date: '2026-01-27 16:45', records: 12, status: 'success', user: 'Ana Costa' },
];

export function DataSourceSection() {
  const [activeTab, setActiveTab] = useState('sources');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <Badge className="bg-status-success/10 text-status-success border-status-success/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Conectado</Badge>;
      case 'error':
        return <Badge className="bg-status-critical/10 text-status-critical border-status-critical/20"><AlertCircle className="w-3 h-3 mr-1" /> Erro</Badge>;
      case 'pending':
        return <Badge className="bg-status-warning/10 text-status-warning border-status-warning/20"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'active':
        return <Badge className="bg-status-success/10 text-status-success border-status-success/20">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'csv': return <FileSpreadsheet className="w-5 h-5 text-status-success" />;
      case 'manual': return <TableIcon className="w-5 h-5 text-status-warning" />;
      default: return <FileSpreadsheet className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="gradient-accent">
          <Plus className="w-4 h-4 mr-2" />
          Nova Planilha
        </Button>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV/Excel
        </Button>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border">
          <TabsTrigger value="sources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Planilhas
          </TabsTrigger>
          <TabsTrigger value="mappings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TableIcon className="w-4 h-4 mr-2" />
            Mapeamentos
          </TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Upload className="w-4 h-4 mr-2" />
            Importação
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Planilhas */}
        <TabsContent value="sources" className="mt-6">
          <div className="grid gap-4">
            {mockDataSources.map((source) => (
              <Card key={source.id} className="card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        {getTypeIcon(source.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{source.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="capitalize">{source.type === 'csv' ? 'Planilha' : 'Manual'}</span>
                          <span>•</span>
                          <span>{source.records.toLocaleString('pt-BR')} registros</span>
                          <span>•</span>
                          <span>Última atualização: {source.lastSync}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {source.tables.map((table) => (
                            <Badge key={table} variant="outline" className="text-xs">{table}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(source.status)}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mapeamentos */}
        <TabsContent value="mappings" className="mt-6">
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Mapeamento de Campos</CardTitle>
                  <CardDescription>Configure como os dados das fontes alimentam as métricas</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Mapeamento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo de Origem</TableHead>
                    <TableHead>Métrica de Destino</TableHead>
                    <TableHead>Transformação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-mono text-sm">{mapping.sourceField}</TableCell>
                      <TableCell className="font-medium">{mapping.targetMetric}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{mapping.transformation}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(mapping.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Importação Manual */}
        <TabsContent value="import" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload de Arquivo
                </CardTitle>
                <CardDescription>Importe dados via CSV ou Excel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Arraste um arquivo ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground mt-1">Suporta CSV, XLS, XLSX (máx. 10MB)</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>Tabela de Destino</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Selecione a tabela..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="faturamento">Faturamento Mensal</SelectItem>
                        <SelectItem value="custos">Custos Operacionais</SelectItem>
                        <SelectItem value="metas">Metas por Setor</SelectItem>
                        <SelectItem value="estoque">Giro de Estoque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Período de Referência</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">Janeiro</SelectItem>
                          <SelectItem value="02">Fevereiro</SelectItem>
                          <SelectItem value="03">Março</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button className="w-full gradient-accent">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Dados
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TableIcon className="w-5 h-5" />
                  Entrada Manual de Dados
                </CardTitle>
                <CardDescription>Adicione valores diretamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Métrica</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecione a métrica..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faturamento">Faturamento Mensal</SelectItem>
                      <SelectItem value="ebitda">Margem EBITDA</SelectItem>
                      <SelectItem value="giro">Giro de Estoque</SelectItem>
                      <SelectItem value="leads">Leads Qualificados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor</Label>
                    <Input type="number" placeholder="0.00" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Unidade</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brl">R$</SelectItem>
                        <SelectItem value="percent">%</SelectItem>
                        <SelectItem value="unit">Unidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Data de Referência</Label>
                  <Input type="date" className="mt-1.5" />
                </div>
                <div>
                  <Label>Setor</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecione o setor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="compras">Compras</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operacoes">Operações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input placeholder="Notas sobre este registro..." className="mt-1.5" />
                </div>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Registro
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Templates Download */}
          <Card className="card-elevated mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Templates para Importação</CardTitle>
              <CardDescription>Baixe os modelos padronizados para cada tipo de dado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {['Faturamento', 'Custos', 'Metas OKR', 'Estoque'].map((template) => (
                  <Button key={template} variant="outline" className="justify-start h-auto py-3">
                    <Download className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{template}</div>
                      <div className="text-xs text-muted-foreground">template.xlsx</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="mt-6">
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Histórico de Importações</CardTitle>
                  <CardDescription>Registro de todas as sincronizações e importações</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as fontes</SelectItem>
                      <SelectItem value="erp">ERP Sankhya</SelectItem>
                      <SelectItem value="csv">CSV/Excel</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockImportHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.source}</TableCell>
                      <TableCell className="text-muted-foreground">{item.date}</TableCell>
                      <TableCell>{item.records.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
