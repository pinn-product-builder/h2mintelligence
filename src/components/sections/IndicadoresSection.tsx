import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, TooltipProps 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Truck, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Chart color palette using CSS variables
const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  accent: 'hsl(var(--chart-2))',
  success: 'hsl(var(--chart-3))',
  warning: 'hsl(var(--chart-4))',
  purple: 'hsl(var(--chart-5))',
  muted: 'hsl(var(--muted))',
  border: 'hsl(var(--border))',
  foreground: 'hsl(var(--muted-foreground))',
};

const faturamentoData = [
  { mes: 'Ago', valor: 1850000 },
  { mes: 'Set', valor: 1920000 },
  { mes: 'Out', valor: 2050000 },
  { mes: 'Nov', valor: 1980000 },
  { mes: 'Dez', valor: 2200000 },
  { mes: 'Jan', valor: 2100000 },
];

const custoLogisticaData = [
  { mes: 'Ago', custo: 85000, meta: 80000 },
  { mes: 'Set', custo: 82000, meta: 80000 },
  { mes: 'Out', custo: 78000, meta: 80000 },
  { mes: 'Nov', custo: 75000, meta: 78000 },
  { mes: 'Dez', custo: 88000, meta: 78000 },
  { mes: 'Jan', custo: 72000, meta: 75000 },
];

const giroEstoqueData = [
  { categoria: 'Matéria Prima', giro: 8.2 },
  { categoria: 'Embalagens', giro: 6.5 },
  { categoria: 'Prod. Acabados', giro: 7.8 },
  { categoria: 'Insumos', giro: 5.2 },
];

const curvaABCData = [
  { name: 'Curva A', value: 70, color: CHART_COLORS.primary },
  { name: 'Curva B', value: 20, color: CHART_COLORS.accent },
  { name: 'Curva C', value: 10, color: CHART_COLORS.muted },
];

const indicators = [
  { title: 'Faturamento Bruto', value: 'R$ 2.1M', change: 12.5, icon: DollarSign, positive: true },
  { title: 'EBITDA', value: 'R$ 386K', change: 8.2, icon: TrendingUp, positive: true },
  { title: 'Custo Logística', value: 'R$ 72K', change: -4.2, icon: Truck, positive: true },
  { title: 'Giro de Estoque', value: '7.2x', change: -0.8, icon: Package, positive: false },
];

// Custom Tooltip Component
function CustomTooltip({ active, payload, label, formatter }: TooltipProps<number, string> & { formatter?: (value: number) => string }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-title">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="chart-tooltip-value" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value as number) : entry.value}
        </p>
      ))}
    </div>
  );
}

export function IndicadoresSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((ind, i) => (
          <Card key={i} className="card-elevated animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <ind.icon className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <span className={cn(
                  "text-sm font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full",
                  ind.positive 
                    ? 'text-success bg-success/10' 
                    : 'text-critical bg-critical/10'
                )}>
                  {ind.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(ind.change)}%
                </span>
              </div>
              <p className="text-2xl font-bold tabular-nums">{ind.value}</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">{ind.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de Categorias */}
      <Tabs defaultValue="financeiro" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="financeiro" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="comercial" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Comercial
          </TabsTrigger>
          <TabsTrigger value="estoque" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Estoque
          </TabsTrigger>
          <TabsTrigger value="logistica" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Logística
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="mt-6 space-y-6 animate-fade-in">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Evolução do Faturamento</CardTitle>
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={faturamentoData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="faturamentoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
                    <XAxis 
                      dataKey="mes" 
                      stroke={CHART_COLORS.foreground} 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke={CHART_COLORS.foreground} 
                      fontSize={12} 
                      tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                    />
                    <Tooltip content={<CustomTooltip formatter={(v) => `R$ ${(v/1000000).toFixed(2)}M`} />} />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke={CHART_COLORS.primary} 
                      strokeWidth={2}
                      fill="url(#faturamentoGradient)"
                      dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4, stroke: 'hsl(var(--card))' }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">DRE Resumido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[
                    { label: 'Receita Bruta', value: 'R$ 2.100.000', percent: '100%' },
                    { label: '(-) Deduções', value: 'R$ 315.000', percent: '15%' },
                    { label: 'Receita Líquida', value: 'R$ 1.785.000', percent: '85%' },
                    { label: '(-) CMV', value: 'R$ 1.071.000', percent: '51%' },
                    { label: 'Lucro Bruto', value: 'R$ 714.000', percent: '34%' },
                    { label: '(-) Despesas Op.', value: 'R$ 328.000', percent: '15.6%' },
                    { label: 'EBITDA', value: 'R$ 386.000', percent: '18.4%', highlight: true },
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex justify-between items-center py-2.5 px-3 -mx-3 rounded-lg transition-colors",
                        item.highlight 
                          ? 'bg-accent/10 border border-accent/20 font-semibold' 
                          : 'hover:bg-muted/50 border-b border-border/50 last:border-0'
                      )}
                    >
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground tabular-nums">{item.percent}</span>
                        <span className="text-sm font-medium w-28 text-right tabular-nums">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comercial" className="mt-6 animate-fade-in">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="card-elevated lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Performance de Vendas por Região</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[
                    { regiao: 'Sudeste', vendas: 980000, meta: 900000 },
                    { regiao: 'Sul', vendas: 450000, meta: 500000 },
                    { regiao: 'Nordeste', vendas: 380000, meta: 350000 },
                    { regiao: 'Centro-Oeste', vendas: 290000, meta: 300000 },
                  ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
                    <XAxis dataKey="regiao" stroke={CHART_COLORS.foreground} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={CHART_COLORS.foreground} fontSize={12} tickFormatter={(v) => `${(v/1000)}K`} tickLine={false} axisLine={false} width={50} />
                    <Tooltip content={<CustomTooltip formatter={(v) => `R$ ${(v/1000).toFixed(0)}K`} />} />
                    <Bar dataKey="vendas" fill={CHART_COLORS.primary} name="Realizado" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="meta" fill={CHART_COLORS.muted} name="Meta" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Top Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[
                    { nome: 'Empresa ABC Ltda', valor: 'R$ 320K' },
                    { nome: 'Indústria XYZ S.A.', valor: 'R$ 285K' },
                    { nome: 'Comércio Delta', valor: 'R$ 198K' },
                    { nome: 'Grupo Omega', valor: 'R$ 175K' },
                    { nome: 'Tech Solutions', valor: 'R$ 142K' },
                  ].map((cliente, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          i === 0 ? "bg-warning text-warning-foreground" :
                          i === 1 ? "bg-muted-foreground/20 text-muted-foreground" :
                          i === 2 ? "bg-warning/60 text-warning-foreground" :
                          "bg-primary/10 text-primary"
                        )}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium truncate max-w-[140px]">{cliente.nome}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{cliente.valor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estoque" className="mt-6 animate-fade-in">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Giro de Estoque por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={giroEstoqueData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} horizontal={false} />
                    <XAxis type="number" stroke={CHART_COLORS.foreground} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="categoria" stroke={CHART_COLORS.foreground} fontSize={12} width={100} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip formatter={(v) => `${v}x`} />} />
                    <Bar dataKey="giro" fill={CHART_COLORS.accent} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Curva ABC de Produtos</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={curvaABCData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={{ stroke: CHART_COLORS.foreground, strokeWidth: 1 }}
                    >
                      {curvaABCData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logistica" className="mt-6 animate-fade-in">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Custo Logístico vs Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={custoLogisticaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
                  <XAxis dataKey="mes" stroke={CHART_COLORS.foreground} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={CHART_COLORS.foreground} fontSize={12} tickFormatter={(v) => `${(v/1000)}K`} tickLine={false} axisLine={false} width={50} />
                  <Tooltip content={<CustomTooltip formatter={(v) => `R$ ${(v/1000).toFixed(0)}K`} />} />
                  <Line 
                    type="monotone" 
                    dataKey="custo" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={2.5} 
                    name="Custo Real"
                    dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4, stroke: 'hsl(var(--card))' }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="meta" 
                    stroke={CHART_COLORS.foreground} 
                    strokeWidth={2} 
                    strokeDasharray="6 4" 
                    name="Meta"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
