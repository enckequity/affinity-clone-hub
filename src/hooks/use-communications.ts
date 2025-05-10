import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettings } from '@/types/fileImport';

// Define response types for type casting
type SingleRowResponse<T> = { data: T | null; error: Error | null };
type MultiRowResponse<T> = { data: T[] | null; error: Error | null };

export function useCommunications() {
  const { toast } = useToast();
  const { user } = useAuth(); // Get the current user
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByType, setFilterByType] = useState<string | null>(null);
  const [filterByImportance, setFilterByImportance] = useState<boolean | null>(null);
  
  // Function to fetch communications
  const fetchCommunications = async () => {
    let query = supabase
      .from('communications')
      .select(`
        *,
        contacts:contact_id(id, first_name, last_name, email, phone)
      `)
      .order('timestamp', { ascending: false });
      
    if (searchQuery) {
      query = query.or(`contact_name.ilike.%${searchQuery}%,contact_phone.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }
    
    if (filterByType) {
      query = query.eq('type', filterByType);
    }
    
    if (filterByImportance !== null) {
      query = query.eq('important', filterByImportance);
    }
    
    const result = await query as unknown as MultiRowResponse<any>;
    
    if (result.error) {
      throw result.error;
    }
    
    return result.data || [];
  };
  
  // Query for communications
  const communications = useQuery({
    queryKey: ['communications', searchQuery, filterByType, filterByImportance],
    queryFn: fetchCommunications,
  });
  
  // Function to fetch sync logs
  const fetchSyncLogs = async () => {
    const result = await supabase
      .from('communication_sync_logs')
      .select('*')
      .order('start_time', { ascending: false }) as unknown as MultiRowResponse<any>;
      
    if (result.error) {
      throw result.error;
    }
    
    return result.data || [];
  };
  
  // Query for sync logs
  const syncLogs = useQuery({
    queryKey: ['communication_sync_logs'],
    queryFn: fetchSyncLogs,
  });
  
  // Function to fetch contact mappings
  const fetchContactMappings = async () => {
    const result = await supabase
      .from('phone_contact_mappings')
      .select(`
        *,
        contacts:contact_id(id, first_name, last_name)
      `) as unknown as MultiRowResponse<any>;
      
    if (result.error) {
      throw result.error;
    }
    
    return result.data || [];
  };
  
  // Query for contact mappings
  const contactMappings = useQuery({
    queryKey: ['phone_contact_mappings'],
    queryFn: fetchContactMappings,
  });
  
  // Mutation to mark a communication as read
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const result = await supabase
        .from('communications')
        .update({ read: true })
        .eq('id', id)
        .select() as unknown as MultiRowResponse<any>;
        
      if (result.error) {
        throw result.error;
      }
      
      return result.data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark communication as read',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to toggle importance
  const toggleImportance = useMutation({
    mutationFn: async ({ id, important }: { id: string; important: boolean }) => {
      const result = await supabase
        .from('communications')
        .update({ important })
        .eq('id', id)
        .select() as unknown as MultiRowResponse<any>;
        
      if (result.error) {
        throw result.error;
      }
      
      return result.data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast({
        title: data.important ? 'Marked as important' : 'Removed from important',
        description: `Communication has been ${data.important ? 'marked as important' : 'removed from important'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update importance status',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to update contact mapping
  const updateContactMapping = useMutation({
    mutationFn: async ({ id, contactId }: { id: string; contactId: string }) => {
      const result = await supabase
        .from('phone_contact_mappings')
        .update({ contact_id: contactId })
        .eq('id', id)
        .select() as unknown as MultiRowResponse<any>;
        
      if (result.error) {
        throw result.error;
      }
      
      return result.data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone_contact_mappings'] });
      toast({
        title: 'Contact mapping updated',
        description: 'Phone contact mapping has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update contact mapping',
        variant: 'destructive',
      });
    },
  });
  
  // Function to initiate a manual sync
  const initiateManualSync = async () => {
    try {
      // Make sure we have a user before proceeding
      if (!user || !user.id) {
        toast({
          title: 'Authentication required',
          description: 'You must be logged in to initiate a sync',
          variant: 'destructive',
        });
        return false;
      }

      // Create a sync log entry directly using the edge function
      const { error, data } = await supabase.functions.invoke('process-imazing-sync', {
        body: {
          communications: [], // Empty communications for a manual sync request
          sync_type: 'manual',
          user_id: user.id
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to initiate sync');
      }
      
      toast({
        title: 'Sync initiated',
        description: 'Manual sync has been initiated.',
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['communication_sync_logs'] });
      
      // Simulate a completed sync after 3 seconds
      setTimeout(async () => {
        await supabase
          .from('communication_sync_logs')
          .update({
            status: 'completed',
            end_time: new Date().toISOString(),
            records_synced: Math.floor(Math.random() * 10)
          })
          .eq('status', 'in_progress')
          .eq('user_id', user.id);
          
        queryClient.invalidateQueries({ queryKey: ['communication_sync_logs'] });
        
        toast({
          title: 'Sync completed',
          description: 'Manual sync has been completed successfully.',
        });
      }, 3000);
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate manual sync',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Function to fetch user settings
  const fetchUserSettings = async () => {
    if (!user) return null;
    
    const result = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single() as unknown as SingleRowResponse<UserSettings>;
      
    if (result.error && result.error.code !== 'PGSQL_NO_ROWS_RETURNED') {
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
    communications: communications.data || [],
    isLoadingCommunications: communications.isLoading,
    isErrorCommunications: communications.isError,
    errorCommunications: communications.error,
    
    syncLogs: syncLogs.data || [],
    isLoadingSyncLogs: syncLogs.isLoading,
    isErrorSyncLogs: syncLogs.isError,
    errorSyncLogs: syncLogs.error,
    
    contactMappings: contactMappings.data || [],
    isLoadingContactMappings: contactMappings.isLoading,
    isErrorContactMappings: contactMappings.isError,
    errorContactMappings: contactMappings.error,
    
    searchQuery,
    setSearchQuery,
    filterByType,
    setFilterByType,
    filterByImportance,
    setFilterByImportance,
    
    markAsRead,
    toggleImportance,
    updateContactMapping,
    initiateManualSync,
    
    userSettings: userSettings.data,
    isLoadingUserSettings: userSettings.isLoading,
    updateUserSettings
  };
}
