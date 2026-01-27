import { mockObjectives, sectorLabels } from '@/data/mockData';
import { OKRCard } from '@/components/dashboard/OKRCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { Users, Target, TrendingUp, Calendar } from 'lucide-react';
import { Sector } from '@/types/okr';

interface SectorSectionProps {
  sector: Sector;
}

const sectorData: Record<string, { 
  responsavel: string; 
  equipe: number; 
  meta: string; 
  proximoCheckpoint: string;
  kpis: { label: string; valor: string; meta: string; progresso: number }[];
}> = {
  comercial: {
    responsavel: 'Carlos Silva',
    equipe: 8,
    meta: 'R$ 7.5M no trimestre',
    proximoCheckpoint: '03/02/2026',
    kpis: [
      { label: 'Faturamento Mensal', valor: 'R$ 2.1M', meta: 'R$ 2.5M', progresso: 84 },
      { label: 'Novos Clientes', valor: '9', meta: '15', progresso: 60 },
      { label: 'Ticket Médio', valor: 'R$ 45K', meta: 'R$ 50K', progresso: 90 },
      { label: 'Taxa de Conversão', valor: '28%', meta: '32%', progresso: 87 },
    ]
  },
  financeiro: {
    responsavel: 'Roberto Mendes',
    equipe: 5,
    meta: 'Margem EBITDA 20%',
    proximoCheckpoint: '05/02/2026',
    kpis: [
      { label: 'EBITDA', valor: '18.4%', meta: '20%', progresso: 92 },
      { label: 'Redução de Custos', valor: '5%', meta: '15%', progresso: 33 },
      { label: 'Contratos Renegociados', valor: '2', meta: '5', progresso: 40 },
      { label: 'Prazo Médio Recebimento', valor: '35 dias', meta: '30 dias', progresso: 85 },
    ]
  },
  compras: {
    responsavel: 'Fernanda Alves',
    equipe: 4,
    meta: 'Giro de estoque 8x/ano',
    proximoCheckpoint: '01/02/2026',
    kpis: [
      { label: 'Giro de Estoque', valor: '7.2x', meta: '8x', progresso: 90 },
      { label: 'Estoque Obsoleto', valor: '-24%', meta: '-30%', progresso: 80 },
      { label: 'Lead Time Fornecedores', valor: '12 dias', meta: '10 dias', progresso: 80 },
      { label: 'Saving em Compras', valor: '8%', meta: '12%', progresso: 66 },
    ]
  },
  marketing: {
    responsavel: 'Bruno Martins',
    equipe: 6,
    meta: '500 leads qualificados',
    proximoCheckpoint: '07/02/2026',
    kpis: [
      { label: 'Leads Gerados', valor: '120', meta: '500', progresso: 24 },
      { label: 'Tráfego Orgânico', valor: '+18%', meta: '+50%', progresso: 36 },
      { label: 'Engajamento Redes', valor: '4.2%', meta: '5%', progresso: 84 },
      { label: 'Custo por Lead', valor: 'R$ 85', meta: 'R$ 60', progresso: 70 },
    ]
  },
  operacoes: {
    responsavel: 'André Souza',
    equipe: 12,
    meta: 'Reduzir ciclo em 20%',
    proximoCheckpoint: '04/02/2026',
    kpis: [
      { label: 'Tempo de Ciclo', valor: '-14%', meta: '-20%', progresso: 70 },
      { label: 'Processos Automatizados', valor: '2', meta: '3', progresso: 66 },
      { label: 'Eficiência Produtiva', valor: '87%', meta: '92%', progresso: 94 },
      { label: 'Índice de Defeitos', valor: '1.2%', meta: '1%', progresso: 80 },
    ]
  },
};

export function SectorSection({ sector }: SectorSectionProps) {
  const sectorOKRs = mockObjectives.filter(obj => obj.sector === sector);
  const data = sectorData[sector] || sectorData.comercial;
  const avgProgress = sectorOKRs.length > 0 
    ? Math.round(sectorOKRs.reduce((acc, obj) => acc + obj.progress, 0) / sectorOKRs.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header do Setor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Responsável</p>
              <p className="font-medium">{data.responsavel}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meta Principal</p>
              <p className="font-medium">{data.meta}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progresso Médio</p>
              <p className="font-medium">{avgProgress}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próximo Checkpoint</p>
              <p className="font-medium">{data.proximoCheckpoint}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs do Setor */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">Indicadores do Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.kpis.map((kpi, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                  <span className="text-xs text-muted-foreground">Meta: {kpi.meta}</span>
                </div>
                <p className="text-xl font-bold">{kpi.valor}</p>
                <ProgressBar progress={kpi.progresso} size="sm" showLabel />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* OKRs do Setor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">OKRs Ativos</h3>
        {sectorOKRs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {sectorOKRs.map((objective, index) => (
              <OKRCard key={objective.id} objective={objective} index={index} />
            ))}
          </div>
        ) : (
          <Card className="card-elevated p-8 text-center">
            <p className="text-muted-foreground">Nenhum OKR cadastrado para este setor no ciclo atual.</p>
          </Card>
        )}
      </div>

      {/* Equipe */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">Equipe ({data.equipe} membros)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: data.equipe }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-sm">Colaborador {i + 1}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
