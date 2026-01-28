import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Target, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Sector } from '@/types/okr';

const keyResultSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200),
  type: z.enum(['numeric', 'percentage', 'boolean']),
  target: z.coerce.number().min(0, 'Meta deve ser positiva'),
  baseline: z.coerce.number().min(0, 'Baseline deve ser positivo'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  owner: z.string().min(2, 'Responsável é obrigatório'),
});

const okrFormSchema = z.object({
  title: z.string()
    .min(10, 'Título deve ter pelo menos 10 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  sector: z.enum(['comercial', 'financeiro', 'marketing', 'compras', 'operacoes', 'diretoria'], {
    required_error: 'Selecione um setor',
  }),
  owner: z.string().min(2, 'Responsável é obrigatório'),
  period: z.string().min(1, 'Período é obrigatório'),
  priority: z.enum(['high', 'medium', 'low'], {
    required_error: 'Selecione uma prioridade',
  }),
  keyResults: z.array(keyResultSchema).min(1, 'Adicione pelo menos 1 Key Result').max(5, 'Máximo de 5 Key Results'),
});

type OKRFormData = z.infer<typeof okrFormSchema>;

const sectorOptions = [
  { value: 'comercial', label: 'Comercial' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'compras', label: 'Compras' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'diretoria', label: 'Diretoria' },
];

const periodOptions = [
  { value: 'Q1 2026', label: 'Q1 2026 (Jan-Mar)' },
  { value: 'Q2 2026', label: 'Q2 2026 (Abr-Jun)' },
  { value: 'Q3 2026', label: 'Q3 2026 (Jul-Set)' },
  { value: 'Q4 2026', label: 'Q4 2026 (Out-Dez)' },
];

const priorityOptions = [
  { value: 'high', label: 'Alta', color: 'text-status-critical' },
  { value: 'medium', label: 'Média', color: 'text-status-warning' },
  { value: 'low', label: 'Baixa', color: 'text-muted-foreground' },
];

const ownerOptions = [
  'Carlos Silva', 'Ana Costa', 'Pedro Santos', 'Maria Lima', 
  'Roberto Mendes', 'Fernanda Alves', 'Bruno Martins', 'André Souza'
];

const krTypeOptions = [
  { value: 'numeric', label: 'Numérico' },
  { value: 'percentage', label: 'Percentual' },
  { value: 'boolean', label: 'Sim/Não' },
];

interface NewOKRFormProps {
  trigger?: React.ReactNode;
}

export function NewOKRForm({ trigger }: NewOKRFormProps) {
  const [open, setOpen] = useState(false);
  const { addObjective } = useApp();

  const form = useForm<OKRFormData>({
    resolver: zodResolver(okrFormSchema),
    defaultValues: {
      title: '',
      description: '',
      sector: undefined,
      owner: '',
      period: 'Q1 2026',
      priority: 'medium',
      keyResults: [
        { title: '', type: 'numeric', target: 0, baseline: 0, unit: '', owner: '' }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'keyResults',
  });

  const onSubmit = (data: OKRFormData) => {
    addObjective({
      title: data.title,
      description: data.description,
      sector: data.sector as Sector,
      owner: data.owner,
      period: data.period,
      priority: data.priority,
      keyResults: data.keyResults.map((kr, index) => ({
        id: `kr-new-${Date.now()}-${index}`,
        title: kr.title,
        type: kr.type,
        target: kr.target,
        baseline: kr.baseline,
        unit: kr.unit,
        owner: kr.owner,
        current: 0,
        progress: 0,
        status: 'on-track' as const,
        lastUpdate: new Date().toISOString().split('T')[0],
      })),
    });
    
    toast({
      title: 'OKR criado com sucesso!',
      description: `Objetivo "${data.title}" foi cadastrado com ${data.keyResults.length} Key Results.`,
    });
    
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 gradient-accent text-accent-foreground border-0">
            <Plus className="w-4 h-4" />
            Novo OKR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Novo Objetivo (OKR)
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo objetivo com seus Key Results associados
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Objetivo */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Objetivo
              </h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Objetivo *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Aumentar faturamento em 25% no Q1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Descreva o objetivo de forma clara e mensurável
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o contexto, motivação e impacto esperado deste objetivo..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sectorOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ownerOptions.map(name => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período/Ciclo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {periodOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
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
            </div>

            {/* Key Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Key Results ({fields.length}/5)
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: '', type: 'numeric', target: 0, baseline: 0, unit: '', owner: '' })}
                  disabled={fields.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar KR
                </Button>
              </div>

              {form.formState.errors.keyResults?.root && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.keyResults.root.message}
                </div>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-dashed">
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Key Result {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name={`keyResults.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título do KR *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Atingir R$ 2.5M em vendas mensais" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {krTypeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.baseline`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Baseline</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.target`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta *</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="100" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidade *</FormLabel>
                              <FormControl>
                                <Input placeholder="R$, %, un" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`keyResults.${index}.owner`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável pelo KR *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o responsável" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ownerOptions.map(name => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-accent">
                Criar OKR
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
