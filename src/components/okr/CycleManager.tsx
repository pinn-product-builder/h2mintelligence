import { useState } from 'react';
import { useCycles, useObjectives, useCreateCycle } from '@/hooks/useSupabaseData';
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
import { Settings, Plus, Pencil, Trash2, Archive, Calendar, Loader2 } from 'lucide-react';
import { OKRCycle } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function CycleManager() {
  const { data: cycles = [], isLoading } = useCycles();
  const { data: allObjectives = [] } = useObjectives();
  const createCycle = useCreateCycle();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<OKRCycle | null>(null);
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleStartDate, setNewCycleStartDate] = useState('');
  const [newCycleEndDate, setNewCycleEndDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'delete' | 'archive';
    cycle: OKRCycle | null;
    okrCount: number;
  }>({ open: false, type: 'delete', cycle: null, okrCount: 0 });

  const getOKRCountForCycle = (cycleId: string) => {
    return allObjectives.filter((obj) => obj.cycle_id === cycleId).length;
  };

  const handleAddCycle = async () => {
    if (!newCycleName.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do ciclo', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCycle.mutateAsync({
        name: newCycleName,
        start_date: newCycleStartDate,
        end_date: newCycleEndDate,
        is_active: false,
        is_archived: false,
      });

      setNewCycleName('');
      setNewCycleStartDate('');
      setNewCycleEndDate('');
      setShowAddForm(false);
      toast({ title: 'Ciclo criado', description: `"${newCycleName}" foi adicionado.` });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível criar o ciclo.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCycle = async () => {
    if (!editingCycle) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('okr_cycles')
        .update({
          name: editingCycle.name,
          start_date: editingCycle.start_date,
          end_date: editingCycle.end_date,
        })
        .eq('id', editingCycle.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      setEditingCycle(null);
      toast({ title: 'Ciclo atualizado', description: 'As alterações foram salvas.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o ciclo.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveClick = (cycle: OKRCycle) => {
    const okrCount = getOKRCountForCycle(cycle.id);

    if (okrCount === 0) {
      setConfirmDialog({ open: true, type: 'delete', cycle, okrCount });
    } else {
      setConfirmDialog({ open: true, type: 'archive', cycle, okrCount });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.cycle) return;

    setIsSubmitting(true);
    try {
      if (confirmDialog.type === 'delete') {
        const { error } = await supabase
          .from('okr_cycles')
          .delete()
          .eq('id', confirmDialog.cycle.id);
        
        if (error) throw error;
        toast({ title: 'Ciclo excluído', description: `"${confirmDialog.cycle.name}" foi removido.` });
      } else {
        const { error } = await supabase
          .from('okr_cycles')
          .update({ is_archived: true })
          .eq('id', confirmDialog.cycle.id);

        if (error) throw error;
        toast({
          title: 'Ciclo arquivado',
          description: `"${confirmDialog.cycle.name}" foi movido para o histórico.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['cycles'] });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível completar a ação.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setConfirmDialog({ open: false, type: 'delete', cycle: null, okrCount: 0 });
    }
  };

  const activeCycles = cycles.filter((c) => !c.is_archived);

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

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {activeCycles.map((cycle) => {
                const okrCount = getOKRCountForCycle(cycle.id);

                return (
                  <div
                    key={cycle.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    {editingCycle?.id === cycle.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingCycle.name}
                          onChange={(e) =>
                            setEditingCycle({ ...editingCycle, name: e.target.value })
                          }
                          placeholder="Nome do ciclo"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleEditCycle} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
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
                              {cycle.name}
                              {cycle.is_active && (
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
                      value={newCycleName}
                      onChange={(e) => setNewCycleName(e.target.value)}
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
                    <Button size="sm" onClick={handleAddCycle} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewCycleName('');
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
          )}

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
                  O ciclo <strong>"{confirmDialog.cycle?.name}"</strong> não possui OKRs
                  vinculados e será excluído permanentemente.
                </>
              ) : (
                <>
                  O ciclo <strong>"{confirmDialog.cycle?.name}"</strong> possui{' '}
                  <strong>{confirmDialog.okrCount} OKR{confirmDialog.okrCount !== 1 ? 's' : ''}</strong>{' '}
                  vinculado{confirmDialog.okrCount !== 1 ? 's' : ''}. Ele será movido para o histórico
                  e poderá ser consultado posteriormente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (confirmDialog.type === 'delete' ? 'Excluir' : 'Arquivar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
