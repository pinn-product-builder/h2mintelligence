import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Truck, Users } from 'lucide-react';

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
  { name: 'Curva A', value: 70, color: 'hsl(var(--primary))' },
  { name: 'Curva B', value: 20, color: 'hsl(var(--accent))' },
  { name: 'Curva C', value: 10, color: 'hsl(var(--muted))' },
];

const indicators = [
  { title: 'Faturamento Bruto', value: 'R$ 2.1M', change: 12.5, icon: DollarSign, positive: true },
  { title: 'EBITDA', value: 'R$ 386K', change: 8.2, icon: TrendingUp, positive: true },
  { title: 'Custo Logística', value: 'R$ 72K', change: -4.2, icon: Truck, positive: true },
  { title: 'Giro de Estoque', value: '7.2x', change: -0.8, icon: Package, positive: false },
];

export function IndicadoresSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((ind, i) => (
          <Card key={i} className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ind.icon className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-sm font-medium flex items-center gap-1 ${ind.positive ? 'text-success' : 'text-critical'}`}>
                  {ind.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(ind.change)}%
                </span>
              </div>
              <p className="text-2xl font-bold mt-3">{ind.value}</p>
              <p className="text-sm text-muted-foreground">{ind.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de Categorias */}
      <Tabs defaultValue="financeiro" className="w-full">
        <TabsList>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="logistica">Logística</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-base">Evolução do Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={faturamentoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip 
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`R$ ${(value/1000000).toFixed(2)}M`, 'Faturamento']}
                    />
                    <Area type="monotone" dataKey="valor" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-base">DRE Resumido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Receita Bruta', value: 'R$ 2.100.000', percent: '100%' },
                    { label: '(-) Deduções', value: 'R$ 315.000', percent: '15%' },
                    { label: 'Receita Líquida', value: 'R$ 1.785.000', percent: '85%' },
                    { label: '(-) CMV', value: 'R$ 1.071.000', percent: '51%' },
                    { label: 'Lucro Bruto', value: 'R$ 714.000', percent: '34%' },
                    { label: '(-) Despesas Op.', value: 'R$ 328.000', percent: '15.6%' },
                    { label: 'EBITDA', value: 'R$ 386.000', percent: '18.4%', highlight: true },
                  ].map((item, i) => (
                    <div key={i} className={`flex justify-between items-center py-2 ${item.highlight ? 'bg-primary/10 -mx-4 px-4 rounded-lg font-semibold' : 'border-b border-border'}`}>
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{item.percent}</span>
                        <span className="text-sm font-medium w-28 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comercial" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="card-elevated lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Performance de Vendas por Região</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { regiao: 'Sudeste', vendas: 980000, meta: 900000 },
                    { regiao: 'Sul', vendas: 450000, meta: 500000 },
                    { regiao: 'Nordeste', vendas: 380000, meta: 350000 },
                    { regiao: 'Centro-Oeste', vendas: 290000, meta: 300000 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="regiao" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000)}K`} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="vendas" fill="hsl(var(--primary))" name="Realizado" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="meta" fill="hsl(var(--muted))" name="Meta" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-base">Top Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nome: 'Empresa ABC Ltda', valor: 'R$ 320K' },
                    { nome: 'Indústria XYZ S.A.', valor: 'R$ 285K' },
                    { nome: 'Comércio Delta', valor: 'R$ 198K' },
                    { nome: 'Grupo Omega', valor: 'R$ 175K' },
                    { nome: 'Tech Solutions', valor: 'R$ 142K' },
                  ].map((cliente, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{i + 1}</span>
                        <span className="text-sm">{cliente.nome}</span>
                      </div>
                      <span className="text-sm font-medium">{cliente.valor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estoque" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-base">Giro de Estoque por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={giroEstoqueData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis type="category" dataKey="categoria" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="giro" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-base">Curva ABC de Produtos</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={curvaABCData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {curvaABCData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logistica" className="mt-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Custo Logístico vs Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={custoLogisticaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000)}K`} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="custo" stroke="hsl(var(--primary))" strokeWidth={2} name="Custo Real" />
                  <Line type="monotone" dataKey="meta" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
