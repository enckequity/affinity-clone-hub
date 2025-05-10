
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettings } from '@/types/fileImport';
import { SingleRowResponse, CodedError } from '@/types/communicationTypes';

export function useUserSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Function to fetch user settings
  const fetchUserSettings = async () => {
    if (!user) return null;
    
    const result = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single() as unknown as SingleRowResponse<UserSettings>;
      
    if (result.error && (result.error as CodedError).code !== 'PGSQL_NO_ROWS_RETURNED') {
      console.error("Error fetching user settings:", result.error);
      throw result.error;
    }
    
    return result.data as UserSettings || null;
  };
  
  // Query for user settings
  const userSettings = useQuery({
    queryKey: ['user-settings'],
    queryFn: fetchUserSettings,
    enabled: !!user
  });
  
  // Mutation to update user settings
  const updateUserSettings = useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!user) throw new Error('User not authenticated');
      
      const result = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings
        }, {
          onConflict: 'user_id'
        })
        .select() as unknown as MultiRowResponse<UserSettings>;
        
      if (result.error) throw result.error;
      
      return result.data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: 'Settings updated',
        description: 'Your settings have been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });
  
  return {
    userSettings: userSettings.data,
    isLoadingUserSettings: userSettings.isLoading,
    updateUserSettings
  };
}
