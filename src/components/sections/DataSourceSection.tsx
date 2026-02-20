import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useImportLogs } from '@/hooks/useImportLogs';
import { checkDataHubAccess } from '@/lib/dataHubPermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImportWizard } from '@/components/data/ImportWizard';
import { ImportLogViewer } from '@/components/data/ImportLogViewer';
import { NewSourceWithMapping } from '@/components/data/NewSourceWithMapping';
import { toast } from '@/hooks/use-toast';
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
  Download,
  Lock,
  History
} from 'lucide-react';

interface DataMapping {
  id: string;
  sourceField: string;
  targetMetric: string;
  transformation: string;
  status: 'active' | 'inactive';
}

const mockMappings: DataMapping[] = [
  { id: '1', sourceField: 'faturamento.valor_total', targetMetric: 'Faturamento Mensal', transformation: 'SUM', status: 'active' },
  { id: '2', sourceField: 'custos.valor', targetMetric: 'Custos Operacionais', transformation: 'SUM', status: 'active' },
  { id: '3', sourceField: 'estoque.quantidade', targetMetric: 'Giro de Estoque', transformation: 'AVG', status: 'active' },
  { id: '4', sourceField: 'dre.margem', targetMetric: 'Margem EBITDA', transformation: 'AVG', status: 'active' },
  { id: '5', sourceField: 'leads.qualificados', targetMetric: 'Leads Qualificados', transformation: 'COUNT', status: 'active' },
];

export function DataSourceSection() {
  const { user } = useAuth();
  const { dataSources, addDataSource, removeDataSource, syncDataSource } = useApp();
  const { logs, filter, setFilter, deleteLog, stats } = useImportLogs();
  const permissions = checkDataHubAccess(user?.role);
  
  const [activeTab, setActiveTab] = useState('sources');
  const [newSourceOpen, setNewSourceOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceTable, setNewSourceTable] = useState('');
  const [manualMetric, setManualMetric] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [manualUnit, setManualUnit] = useState('brl');
  const [manualSector, setManualSector] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Access denied view
  if (!permissions.canView) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para acessar o Data Hub. 
          Entre em contato com o administrador para solicitar acesso.
        </p>
      </div>
    );
  }

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

  const handleAddSource = (data: { name: string; targetTable: string; mappings: { id: string; sourceColumn: string; targetField: string; transformation: string }[] }) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    
    addDataSource({
      name: data.name,
      type: 'csv',
      status: 'connected',
      lastSync: formattedDate,
      records: 0,
      tables: [data.targetTable],
    });
    
    toast({
      title: 'Fonte adicionada!',
      description: `${data.name} foi configurada com ${data.mappings.length} mapeamento(s).`,
    });
  };

  const handleManualEntry = () => {
    if (!manualMetric || !manualValue || !manualSector) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    
    toast({
      title: 'Registro adicionado!',
      description: `Valor ${manualValue} ${manualUnit === 'brl' ? 'R$' : manualUnit === 'percent' ? '%' : 'un'} registrado para ${manualMetric}.`,
    });
    
    setManualMetric('');
    setManualValue('');
    setManualNotes('');
  };

  const handleSyncAll = () => {
    dataSources.forEach(ds => {
      syncDataSource(ds.id);
    });
    toast({
      title: 'Sincronização completa!',
      description: `${dataSources.length} fontes de dados atualizadas.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          className="gradient-accent"
          onClick={() => setImportWizardOpen(true)}
          disabled={!permissions.canImport}
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar Dados
        </Button>
        
        <Button variant="outline" onClick={() => setNewSourceOpen(true)} disabled={!permissions.canImport}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Fonte
        </Button>
        
        <Button variant="outline" onClick={handleSyncAll}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      {/* New Source With Mapping Dialog */}
      <NewSourceWithMapping
        open={newSourceOpen}
        onOpenChange={setNewSourceOpen}
        onSubmit={handleAddSource}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border">
          <TabsTrigger value="sources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Planilhas ({dataSources.length})
          </TabsTrigger>
          <TabsTrigger value="mappings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TableIcon className="w-4 h-4 mr-2" />
            Mapeamentos
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="w-4 h-4 mr-2" />
            Logs ({stats.total})
          </TabsTrigger>
        </TabsList>

        {/* Planilhas */}
        <TabsContent value="sources" className="mt-6">
          <div className="grid gap-4">
            {dataSources.map((source) => (
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => syncDataSource(source.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeDataSource(source.id)}
                          disabled={!permissions.canDelete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {dataSources.length === 0 && (
              <Card className="card-elevated">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma fonte de dados configurada.</p>
                  <p className="text-sm">Clique em "Importar Dados" para adicionar.</p>
                </CardContent>
              </Card>
            )}
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
                <Button size="sm" disabled={!permissions.canManageMappings}>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!permissions.canManageMappings}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={!permissions.canManageMappings}>
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

        {/* Logs */}
        <TabsContent value="logs" className="mt-6">
          <ImportLogViewer
            logs={logs}
            filter={filter}
            onFilterChange={setFilter}
            onDeleteLog={permissions.canDelete ? deleteLog : undefined}
            onRollback={permissions.canDelete ? (id) => {
              // Update local state to reflect rollback
              const log = logs.find(l => l.id === id);
              if (log) {
                // The DB function already updated the status, just refresh local state
                deleteLog(id);
              }
            } : undefined}
            stats={stats}
          />
        </TabsContent>
      </Tabs>

      {/* Import Wizard Modal */}
      <ImportWizard
        open={importWizardOpen}
        onOpenChange={setImportWizardOpen}
        onImportComplete={() => setActiveTab('logs')}
      />
    </div>
  );
}
