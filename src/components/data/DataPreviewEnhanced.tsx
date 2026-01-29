import { useState, useMemo } from 'react';
import { DataStatistics, ColumnDataType } from '@/types/dataHub';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileSpreadsheet, 
  Columns, 
  AlertTriangle, 
  Hash, 
  Calendar, 
  DollarSign, 
  Percent, 
  Type,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPreviewEnhancedProps {
  data: Record<string, unknown>[];
  columns: string[];
  statistics: DataStatistics | null;
  maxRows?: number;
}

const typeIcons: Record<ColumnDataType, React.ReactNode> = {
  text: <Type className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
  date: <Calendar className="w-3.5 h-3.5" />,
  currency: <DollarSign className="w-3.5 h-3.5" />,
  percentage: <Percent className="w-3.5 h-3.5" />,
  boolean: <Hash className="w-3.5 h-3.5" />,
};

const typeLabels: Record<ColumnDataType, string> = {
  text: 'Texto',
  number: 'Número',
  date: 'Data',
  currency: 'Moeda',
  percentage: 'Percentual',
  boolean: 'Booleano',
};

const typeColors: Record<ColumnDataType, string> = {
  text: 'bg-muted text-muted-foreground',
  number: 'bg-primary/10 text-primary',
  date: 'bg-accent/10 text-accent',
  currency: 'bg-success/10 text-success',
  percentage: 'bg-warning/10 text-warning',
  boolean: 'bg-secondary text-secondary-foreground',
};

export function DataPreviewEnhanced({ 
  data, 
  columns, 
  statistics,
  maxRows = 20 
}: DataPreviewEnhancedProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = maxRows;
  
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const displayedData = useMemo(() => 
    data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage),
    [data, currentPage, rowsPerPage]
  );
  
  const formatValue = (value: unknown, type?: ColumnDataType): string => {
    if (value === null || value === undefined || value === '') return '—';
    
    if (type === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
    
    if (type === 'percentage' && typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    
    if (typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR').format(value);
    }
    
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.totalRows.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground">Linhas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Columns className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.totalColumns}
                  </p>
                  <p className="text-sm text-muted-foreground">Colunas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.nullValues}
                  </p>
                  <p className="text-sm text-muted-foreground">Valores Nulos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Hash className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Object.values(statistics.uniqueValues).reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Valores Únicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Column Types */}
      {statistics && (
        <div className="flex flex-wrap gap-2">
          {columns.map(col => {
            const type = statistics.columnTypes[col] || 'text';
            return (
              <Badge 
                key={col} 
                variant="outline"
                className={cn("gap-1.5", typeColors[type])}
              >
                {typeIcons[type]}
                <span className="font-medium">{col}</span>
                <span className="opacity-60 text-xs">({typeLabels[type]})</span>
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center font-bold">#</TableHead>
                {columns.map(col => (
                  <TableHead key={col} className="min-w-[120px]">
                    <div className="flex items-center gap-2">
                      {statistics && typeIcons[statistics.columnTypes[col] || 'text']}
                      <span>{col}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedData.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">
                    {currentPage * rowsPerPage + index + 1}
                  </TableCell>
                  {columns.map(col => {
                    const value = row[col];
                    const type = statistics?.columnTypes[col];
                    const isEmpty = value === null || value === undefined || value === '';
                    
                    return (
                      <TableCell 
                        key={col}
                        className={cn(
                          isEmpty && "text-muted-foreground/50 italic",
                          type === 'currency' && "font-mono",
                          type === 'number' && "font-mono text-right"
                        )}
                      >
                        {formatValue(value, type)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {currentPage * rowsPerPage + 1} - {Math.min((currentPage + 1) * rowsPerPage, data.length)} de {data.length} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Página {currentPage + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
