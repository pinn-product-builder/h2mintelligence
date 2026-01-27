import { MetricCard } from './MetricCard';
import { OKRCard } from './OKRCard';
import { SectorOverview } from './SectorOverview';
import { QuickStats } from './QuickStats';
import { mockMetrics, mockObjectives, mockSectorSummary } from '@/data/mockData';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OKRs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">OKRs Ativos</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrar
              </Button>
              <Button size="sm" className="gap-2 gradient-accent text-accent-foreground border-0">
                <Plus className="w-4 h-4" />
                Novo OKR
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {mockObjectives.map((objective, index) => (
              <OKRCard key={objective.id} objective={objective} index={index} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <QuickStats />
          <SectorOverview sectors={mockSectorSummary} />
        </div>
      </div>
    </div>
  );
}
