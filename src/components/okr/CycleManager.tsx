import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Plus, Pencil, Trash2, Archive, Calendar } from 'lucide-react';
import { OKRCycle } from '@/types/okr';
import { toast } from '@/hooks/use-toast';

export function CycleManager() {
  const { cycles, objectives, addCycle, updateCycle, deleteCycle, archiveCycle } = useApp();
  const [open, setOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<OKRCycle | null>(null);
  const [newCycleLabel, setNewCycleLabel] = useState('');
  const [newCycleStartDate, setNewCycleStartDate] = useState('');
  const [newCycleEndDate, setNewCycleEndDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'delete' | 'archive';
    cycle: OKRCycle | null;
    okrCount: number;
  }>({ open: false, type: 'delete', cycle: null, okrCount: 0 });

  const getOKRCountForCycle = (cycleLabel: string) => {
    return objectives.filter((obj) => obj.period === cycleLabel).length;
  };

  const handleAddCycle = () => {
    if (!newCycleLabel.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do ciclo', variant: 'destructive' });
      return;
    }

    addCycle({
      label: newCycleLabel,
      startDate: newCycleStartDate,
      endDate: newCycleEndDate,
      isActive: false,
      isArchived: false,
    });

    setNewCycleLabel('');
    setNewCycleStartDate('');
    setNewCycleEndDate('');
    setShowAddForm(false);
    toast({ title: 'Ciclo criado', description: `"${newCycleLabel}" foi adicionado.` });
  };

  const handleEditCycle = () => {
    if (!editingCycle) return;

    updateCycle(editingCycle.id, {
      label: editingCycle.label,
      startDate: editingCycle.startDate,
      endDate: editingCycle.endDate,
    });

    setEditingCycle(null);
    toast({ title: 'Ciclo atualizado', description: 'As alterações foram salvas.' });
  };

  const handleRemoveClick = (cycle: OKRCycle) => {
    const okrCount = getOKRCountForCycle(cycle.label);

    if (okrCount === 0) {
      setConfirmDialog({ open: true, type: 'delete', cycle, okrCount });
    } else {
      setConfirmDialog({ open: true, type: 'archive', cycle, okrCount });
    }
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.cycle) return;

    if (confirmDialog.type === 'delete') {
      deleteCycle(confirmDialog.cycle.id);
      toast({ title: 'Ciclo excluído', description: `"${confirmDialog.cycle.label}" foi removido.` });
    } else {
      archiveCycle(confirmDialog.cycle.id);
      toast({
        title: 'Ciclo arquivado',
        description: `"${confirmDialog.cycle.label}" foi movido para o histórico.`,
      });
    }

    setConfirmDialog({ open: false, type: 'delete', cycle: null, okrCount: 0 });
  };

  const activeCycles = cycles.filter((c) => !c.isArchived);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Gerenciar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Gerenciar Ciclos
            </DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova períodos de OKR
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activeCycles.map((cycle) => {
              const okrCount = getOKRCountForCycle(cycle.label);

              return (
                <div
                  key={cycle.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  {editingCycle?.id === cycle.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editingCycle.label}
                        onChange={(e) =>
                          setEditingCycle({ ...editingCycle, label: e.target.value })
                        }
                        placeholder="Nome do ciclo"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleEditCycle}>
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCycle(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {cycle.label}
                            {cycle.isActive && (
                              <span className="w-2 h-2 rounded-full bg-success" />
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {okrCount} OKR{okrCount !== 1 ? 's' : ''} vinculado{okrCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCycle(cycle)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveClick(cycle)}
                          className="text-destructive hover:text-destructive"
                        >
                          {okrCount > 0 ? (
                            <Archive className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {showAddForm ? (
              <div className="p-4 border rounded-lg border-dashed space-y-3">
                <div className="space-y-2">
                  <Label>Nome do Ciclo *</Label>
                  <Input
                    value={newCycleLabel}
                    onChange={(e) => setNewCycleLabel(e.target.value)}
                    placeholder="Ex: Q1 2027, Anual 2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <Input
                      type="date"
                      value={newCycleStartDate}
                      onChange={(e) => setNewCycleStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <Input
                      type="date"
                      value={newCycleEndDate}
                      onChange={(e) => setNewCycleEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddCycle}>
                    Adicionar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCycleLabel('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4" />
                Novo Ciclo
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'delete'
                ? 'Excluir Ciclo'
                : 'Arquivar Ciclo'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'delete' ? (
                <>
                  O ciclo <strong>"{confirmDialog.cycle?.label}"</strong> não possui OKRs
                  vinculados e será excluído permanentemente.
                </>
              ) : (
                <>
                  O ciclo <strong>"{confirmDialog.cycle?.label}"</strong> possui{' '}
                  <strong>{confirmDialog.okrCount} OKR{confirmDialog.okrCount !== 1 ? 's' : ''}</strong>{' '}
                  vinculado{confirmDialog.okrCount !== 1 ? 's' : ''}. Ele será movido para o histórico
                  e poderá ser consultado posteriormente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmDialog.type === 'delete' ? 'Excluir' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
