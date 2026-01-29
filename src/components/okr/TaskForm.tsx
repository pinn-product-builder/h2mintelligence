import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, ListTodo, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Task, TaskPriority } from '@/types/okr';
import { useProfiles, useCreateTask } from '@/hooks/useSupabaseData';

const taskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  assignedTo: z.string().min(1, 'Selecione um responsável'),
  dueDate: z.date().optional(),
  priority: z.enum(['high', 'medium', 'low']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  krId: string;
  okrId: string;
  onTaskCreated?: (task: Task) => void;
  trigger?: React.ReactNode;
}

const priorityOptions = [
  { value: 'high', label: 'Alta', color: 'text-critical' },
  { value: 'medium', label: 'Média', color: 'text-warning' },
  { value: 'low', label: 'Baixa', color: 'text-muted-foreground' },
];

export function TaskForm({ krId, okrId, onTaskCreated, trigger }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const { data: profiles = [] } = useProfiles();
  const createTask = useCreateTask();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    const selectedProfile = profiles.find(p => p.id === data.assignedTo);
    
    try {
      await createTask.mutateAsync({
        key_result_id: krId,
        title: data.title,
        description: data.description,
        assignee_id: data.assignedTo || undefined,
        due_date: data.dueDate?.toISOString().split('T')[0],
        priority: data.priority as 'low' | 'medium' | 'high',
        status: 'pending',
      });

      // Also call the callback for local state update
      if (onTaskCreated) {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: data.title,
          description: data.description,
          assignedTo: data.assignedTo,
          assignedToName: selectedProfile?.name || 'Não atribuído',
          dueDate: data.dueDate?.toISOString().split('T')[0],
          priority: data.priority as TaskPriority,
          status: 'pending',
          createdAt: new Date().toISOString().split('T')[0],
          parentKRId: krId,
          parentOKRId: okrId,
        };
        onTaskCreated(newTask);
      }

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <Plus className="w-3 h-3" />
            Adicionar Tarefa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-accent" />
            Nova Tarefa
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Preparar apresentação para cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes adicionais da tarefa..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar profissional..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Prazo</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecionar</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className={opt.color}>{opt.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="gradient-accent text-accent-foreground border-0"
                disabled={createTask.isPending}
              >
                {createTask.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Criar Tarefa'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
