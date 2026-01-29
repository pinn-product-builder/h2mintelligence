import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'manual';
  status: 'connected' | 'error' | 'pending';
  lastSync: string;
  records: number;
  tables: string[];
}

interface ImportHistory {
  id: string;
  source: string;
  date: string;
  records: number;
  status: 'success' | 'error';
  user: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface AppContextType {
  // Data Sources (local state - can be migrated to Supabase later)
  dataSources: DataSource[];
  addDataSource: (source: Omit<DataSource, 'id'>) => void;
  removeDataSource: (id: string) => void;
  syncDataSource: (id: string) => void;
  
  // Import History
  importHistory: ImportHistory[];
  addImportRecord: (record: Omit<ImportHistory, 'id'>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'warning' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addDataSource = (source: Omit<DataSource, 'id'>) => {
    const newSource: DataSource = {
      ...source,
      id: `ds-${Date.now()}`,
    };
    setDataSources(prev => [...prev, newSource]);
    addNotification(`Fonte "${source.name}" adicionada com sucesso!`, 'success');
  };

  const removeDataSource = (id: string) => {
    const source = dataSources.find(ds => ds.id === id);
    setDataSources(prev => prev.filter(ds => ds.id !== id));
    if (source) {
      addNotification(`Fonte "${source.name}" removida.`, 'warning');
    }
  };

  const syncDataSource = (id: string) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    
    setDataSources(prev => prev.map(ds => {
      if (ds.id === id) {
        const newRecords = ds.records + Math.floor(Math.random() * 50);
        const record: ImportHistory = {
          id: `imp-${Date.now()}`,
          source: ds.name,
          date: formattedDate,
          records: Math.floor(Math.random() * 100) + 10,
          status: 'success',
          user: 'Sistema',
        };
        setImportHistory(prev => [record, ...prev]);
        return { ...ds, lastSync: formattedDate, records: newRecords, status: 'connected' as const };
      }
      return ds;
    }));
    
    const source = dataSources.find(ds => ds.id === id);
    if (source) {
      addNotification(`"${source.name}" sincronizada com sucesso!`, 'success');
    }
  };

  const addImportRecord = (record: Omit<ImportHistory, 'id'>) => {
    const newRecord: ImportHistory = {
      ...record,
      id: `imp-${Date.now()}`,
    };
    setImportHistory(prev => [newRecord, ...prev]);
  };

  const addNotification = (message: string, type: 'success' | 'warning' | 'error') => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
    
    // Also show toast
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <AppContext.Provider value={{
      dataSources,
      addDataSource,
      removeDataSource,
      syncDataSource,
      importHistory,
      addImportRecord,
      notifications,
      addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
