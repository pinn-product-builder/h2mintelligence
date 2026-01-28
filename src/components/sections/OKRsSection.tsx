import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { sectorLabels } from '@/data/mockData';
import { OKRCard } from '@/components/dashboard/OKRCard';
import { NewOKRForm } from '@/components/okr/NewOKRForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, LayoutGrid, List } from 'lucide-react';

export function OKRsSection() {
  const { objectives } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredObjectives = objectives.filter(obj => {
    const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: objectives.length,
    onTrack: objectives.filter(o => o.status === 'on-track').length,
    attention: objectives.filter(o => o.status === 'attention').length,
    critical: objectives.filter(o => o.status === 'critical').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar OKRs..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="on-track">No Prazo</SelectItem>
              <SelectItem value="attention">Atenção</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <NewOKRForm />
        </div>
      </div>

      {/* Tabs por Ciclo */}
      <Tabs defaultValue="q1-2026" className="w-full">
        <TabsList>
          <TabsTrigger value="q4-2025">Q4 2025</TabsTrigger>
          <TabsTrigger value="q1-2026">Q1 2026</TabsTrigger>
          <TabsTrigger value="q2-2026">Q2 2026</TabsTrigger>
        </TabsList>
        
        <TabsContent value="q4-2025" className="mt-6">
          <div className="card-elevated p-8 text-center text-muted-foreground">
            <p>Ciclo encerrado. 4 OKRs concluídos com 78% de atingimento médio.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="q1-2026" className="mt-6">
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredObjectives.map((objective, index) => (
              <OKRCard key={objective.id} objective={objective} index={index} />
            ))}
          </div>
          
          {filteredObjectives.length === 0 && (
            <div className="card-elevated p-8 text-center text-muted-foreground">
              <p>Nenhum OKR encontrado com os filtros aplicados.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="q2-2026" className="mt-6">
          <div className="card-elevated p-8 text-center text-muted-foreground">
            <p>Ciclo futuro. Planejamento começa em Março/2026.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total de OKRs</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.onTrack}</p>
          <p className="text-sm text-muted-foreground">No Prazo</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.attention}</p>
          <p className="text-sm text-muted-foreground">Atenção</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-2xl font-bold text-critical">{stats.critical}</p>
          <p className="text-sm text-muted-foreground">Crítico</p>
        </div>
      </div>
    </div>
  );
}
