import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { OKRsSection } from '@/components/sections/OKRsSection';
import { IndicadoresSection } from '@/components/sections/IndicadoresSection';
import { SectorSection } from '@/components/sections/SectorSection';
import { UsuariosSection } from '@/components/sections/UsuariosSection';
import { ConfiguracoesSection } from '@/components/sections/ConfiguracoesSection';
import { cn } from '@/lib/utils';
import { Sector } from '@/types/okr';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral dos OKRs e indicadores' },
  okrs: { title: 'Gestão de OKRs', subtitle: 'Cadastro e acompanhamento de objetivos' },
  indicadores: { title: 'Indicadores', subtitle: 'KPIs e métricas do negócio' },
  comercial: { title: 'Setor Comercial', subtitle: 'OKRs e metas da área comercial' },
  financeiro: { title: 'Setor Financeiro', subtitle: 'OKRs e metas da área financeira' },
  compras: { title: 'Setor de Compras', subtitle: 'OKRs e metas de suprimentos' },
  marketing: { title: 'Setor de Marketing', subtitle: 'OKRs e metas de marketing' },
  operacoes: { title: 'Setor de Operações', subtitle: 'OKRs e metas operacionais' },
  usuarios: { title: 'Usuários', subtitle: 'Gerenciamento de usuários e permissões' },
  configuracoes: { title: 'Configurações', subtitle: 'Configurações do sistema' },
};

const Index = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { title, subtitle } = sectionTitles[currentSection] || sectionTitles.dashboard;

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        "ml-64" // Default sidebar width
      )}>
        <Header title={title} subtitle={subtitle} />
        
        <div className="p-6">
          {currentSection === 'dashboard' && <Dashboard />}
          {currentSection === 'okrs' && <OKRsSection />}
          {currentSection === 'indicadores' && <IndicadoresSection />}
          {currentSection === 'usuarios' && <UsuariosSection />}
          {currentSection === 'configuracoes' && <ConfiguracoesSection />}
          {['comercial', 'financeiro', 'compras', 'marketing', 'operacoes'].includes(currentSection) && (
            <SectorSection sector={currentSection as Sector} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
