import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { OKRsSection } from '@/components/sections/OKRsSection';
import { UsuariosSection } from '@/components/sections/UsuariosSection';
import { ConfiguracoesSection } from '@/components/sections/ConfiguracoesSection';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral dos OKRs e indicadores' },
  okrs: { title: 'Gestão de OKRs', subtitle: 'Cadastro e acompanhamento de objetivos' },
  usuarios: { title: 'Usuários', subtitle: 'Gerenciamento de usuários e permissões' },
  configuracoes: { title: 'Configurações', subtitle: 'Configurações do sistema' },
};

const Index = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const { title, subtitle } = sectionTitles[currentSection] || sectionTitles.dashboard;

  const handleSearch = useCallback((term: string) => {
    setCurrentSection('okrs');
    toast({
      title: 'Busca',
      description: `Navegando para OKRs com busca: "${term}"`,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        "ml-64"
      )}>
        <Header title={title} subtitle={subtitle} onSearch={handleSearch} onNavigate={setCurrentSection} />
        
        <div className="p-6">
          {currentSection === 'dashboard' && <Dashboard />}
          {currentSection === 'okrs' && <OKRsSection />}
          {currentSection === 'usuarios' && <UsuariosSection />}
          {currentSection === 'configuracoes' && <ConfiguracoesSection />}
        </div>
      </main>
    </div>
  );
};

export default Index;
