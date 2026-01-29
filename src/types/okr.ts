export type OKRStatus = 'on-track' | 'attention' | 'critical';

export type KRType = 'numeric' | 'percentage' | 'boolean';

export type Sector = 
  | 'comercial'
  | 'financeiro'
  | 'marketing'
  | 'compras'
  | 'operacoes'
  | 'diretoria';

export interface KeyResult {
  id: string;
  title: string;
  type: KRType;
  current: number;
  target: number;
  baseline: number;
  unit: string;
  owner: string;
  progress: number;
  status: OKRStatus;
  lastUpdate: string;
  parentId?: string; // ID do KR pai (se for sub-KR)
  children?: KeyResult[]; // Sub-KRs aninhados
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  sector: Sector;
  owner: string;
  period: string;
  priority: 'high' | 'medium' | 'low';
  keyResults: KeyResult[];
  progress: number;
  status: OKRStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  variant: 'primary' | 'accent' | 'success' | 'warning';
}

export interface SectorSummary {
  sector: Sector;
  label: string;
  totalOKRs: number;
  avgProgress: number;
  onTrack: number;
  attention: number;
  critical: number;
}

export interface OKRCycle {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
}
