import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types for Supabase data
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OKRCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  cycle_id: string;
  sector_id?: string;
  owner_id?: string;
  parent_id?: string;
  status: 'on-track' | 'attention' | 'critical' | 'completed';
  progress: number;
  start_date?: string;
  due_date?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  sector?: Sector;
  owner?: Profile;
  key_results?: KeyResult[];
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  description?: string;
  type: 'numeric' | 'percentage' | 'boolean';
  current_value: number;
  target_value: number;
  unit?: string;
  weight: number;
  owner_id?: string;
  status: 'on-track' | 'attention' | 'critical' | 'completed';
  due_date?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: Profile;
  tasks?: Task[];
}

export interface Task {
  id: string;
  key_result_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assignee?: Profile;
}

// Hook for fetching sectors
export function useSectors() {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Sector[];
    },
  });
}

// Hook for fetching cycles
export function useCycles() {
  return useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_cycles')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as OKRCycle[];
    },
  });
}

// Hook for fetching objectives with related data
export function useObjectives(cycleId?: string) {
  return useQuery({
    queryKey: ['objectives', cycleId],
    queryFn: async () => {
      let query = supabase
        .from('objectives')
        .select(`
          *,
          sector:sectors(*),
          key_results(
            *,
            tasks(*)
          )
        `)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      
      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Objective[];
    },
  });
}

// Hook for fetching archived objectives
export function useArchivedObjectives() {
  return useQuery({
    queryKey: ['archived-objectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectives')
        .select(`
          *,
          sector:sectors(*)
        `)
        .eq('is_archived', true)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Objective[];
    },
  });
}

// Hook for fetching all profiles (for task assignment)
export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Profile[];
    },
  });
}

// Mutations

// Create sector
export function useCreateSector() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sector: Omit<Sector, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sectors')
        .insert(sector)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    },
  });
}

// Create cycle
export function useCreateCycle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cycle: Omit<OKRCycle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('okr_cycles')
        .insert(cycle)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
    },
  });
}

// Create objective
export function useCreateObjective() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (objective: Partial<Objective> & { title: string; cycle_id: string }) => {
      const { data, error } = await supabase
        .from('objectives')
        .insert({
          ...objective,
          owner_id: objective.owner_id || user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}

// Update objective
export function useUpdateObjective() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Objective> & { id: string }) => {
      const { data, error } = await supabase
        .from('objectives')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['archived-objectives'] });
    },
  });
}

// Delete objective
export function useDeleteObjective() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First delete all tasks associated with key results of this objective
      const { data: keyResults } = await supabase
        .from('key_results')
        .select('id')
        .eq('objective_id', id);
      
      if (keyResults && keyResults.length > 0) {
        const krIds = keyResults.map(kr => kr.id);
        await supabase
          .from('tasks')
          .delete()
          .in('key_result_id', krIds);
        
        // Then delete key results
        await supabase
          .from('key_results')
          .delete()
          .eq('objective_id', id);
      }
      
      // Finally delete the objective
      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['archived-objectives'] });
    },
  });
}

// Create key result
export function useCreateKeyResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (keyResult: Partial<KeyResult> & { objective_id: string; title: string }) => {
      const { data, error } = await supabase
        .from('key_results')
        .insert(keyResult)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}

// Update key result
export function useUpdateKeyResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KeyResult> & { id: string }) => {
      const { data, error } = await supabase
        .from('key_results')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: Partial<Task> & { key_result_id: string; title: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}
