import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/types/user';
import { toast } from '@/hooks/use-toast';

export interface UserWithRole {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

// Fetch all users with their roles
export function useUsersWithRoles() {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (profilesError) throw profilesError;

      // For each profile, try to get the role
      // Since admins can see all roles, we fetch them all at once
      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Create a map of user_id to role
      const roleMap: Record<string, AppRole> = {};
      if (allRoles) {
        allRoles.forEach((r) => {
          roleMap[r.user_id] = r.role as AppRole;
        });
      }

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => ({
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        role: roleMap[profile.user_id] || 'visualizador',
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }));

      return usersWithRoles;
    },
  });
}

// Create user via edge function
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      email: string; 
      password: string; 
      name: string; 
      role: AppRole;
      sectorId?: string;
    }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-user', {
        body: data,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar usuário');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: 'Usuário criado',
        description: 'O novo usuário foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update user role via edge function
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; newRole: AppRole }) => {
      const response = await supabase.functions.invoke('update-user-role', {
        body: data,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao atualizar perfil');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: 'Perfil atualizado',
        description: 'O perfil do usuário foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
