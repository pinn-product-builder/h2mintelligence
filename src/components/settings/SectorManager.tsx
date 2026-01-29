import { useState } from 'react';
import { useSectors, useObjectives, useCreateSector } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building2, Plus, Pencil, Trash2, AlertTriangle, Lock, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Sector } from '@/hooks/useSupabaseData';

export function SectorManager() {
  const { user } = useAuth();
  const { data: sectors = [], isLoading } = useSectors();
  const { data: objectives = [] } = useObjectives();
  const createSector = useCreateSector();
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [newSectorName, setNewSectorName] = useState('');
  const [editSectorName, setEditSectorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const getOKRCountForSector = (sectorId: string) => {
    return objectives.filter(obj => obj.sector_id === sectorId).length;
  };

  const handleCreateSector = async () => {
    if (!newSectorName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createSector.mutateAsync({
        name: newSectorName.trim(),
        is_active: true,
        color: '#6366f1',
      });

      toast({
        title: 'Setor criado!',
        description: `Setor "${newSectorName}" foi adicionado com sucesso.`,
      });

      setNewSectorName('');
      setIsCreateOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o setor.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSector = async () => {
    if (!editingSector || !editSectorName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('sectors')
        .update({ name: editSectorName.trim() })
        .eq('id', editingSector.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['sectors'] });

      toast({
        title: 'Setor atualizado!',
        description: `Setor "${editSectorName}" foi atualizado.`,
      });

      setEditingSector(null);
      setEditSectorName('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o setor.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSector = async (sector: Sector) => {
    const okrCount = getOKRCountForSector(sector.id);
    
    if (okrCount > 0) {
      toast({
        title: 'Não é possível excluir',
        description: `Este setor possui ${okrCount} OKR(s) vinculado(s). Arquive os OKRs primeiro.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sector.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['sectors'] });

      toast({
        title: 'Setor excluído',
        description: `Setor "${sector.name}" foi removido.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o setor.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-12 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar setores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Gerenciamento de Setores
            </CardTitle>
            <CardDescription>
              Crie, edite e exclua setores da organização
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-accent text-accent-foreground border-0">
                <Plus className="w-4 h-4" />
                Novo Setor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Novo Setor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Setor</Label>
                  <Input
                    placeholder="Ex: Recursos Humanos"
                    value={newSectorName}
                    onChange={(e) => setNewSectorName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSector} disabled={!newSectorName.trim() || isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Setor'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : sectors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum setor cadastrado</p>
            <p className="text-sm">Clique em "Novo Setor" para adicionar</p>
          </div>
        ) : (
          sectors.map(sector => {
            const okrCount = getOKRCountForSector(sector.id);
            
            return (
              <div
                key={sector.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium">{sector.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {okrCount} OKR{okrCount !== 1 ? 's' : ''} vinculado{okrCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Edit Dialog */}
                  <Dialog open={editingSector?.id === sector.id} onOpenChange={(open) => {
                    if (open) {
                      setEditingSector(sector);
                      setEditSectorName(sector.name);
                    } else {
                      setEditingSector(null);
                      setEditSectorName('');
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Editar Setor</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nome do Setor</Label>
                          <Input
                            value={editSectorName}
                            onChange={(e) => setEditSectorName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSector(null)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdateSector} disabled={!editSectorName.trim() || isSubmitting}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        disabled={okrCount > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Excluir Setor
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o setor "{sector.name}"?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSector(sector)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })
        )}

        {sectors.some(s => getOKRCountForSector(s.id) > 0) && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span>
              Setores com OKRs vinculados não podem ser excluídos. Arquive os OKRs primeiro.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
