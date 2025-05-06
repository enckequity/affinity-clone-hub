
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  };
  
  // Query for communications
  const communications = useQuery({
    queryKey: ['communications', searchQuery, filterByType, filterByImportance],
    queryFn: fetchCommunications,
  });
  
  // Function to fetch sync logs
  const fetchSyncLogs = async () => {
    const { data, error } = await supabase
      .from('communication_sync_logs')
      .select('*')
      .order('start_time', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  };
  
  // Query for sync logs
  const syncLogs = useQuery({
    queryKey: ['communication_sync_logs'],
    queryFn: fetchSyncLogs,
  });
  
  // Function to fetch contact mappings
  const fetchContactMappings = async () => {
    const { data, error } = await supabase
      .from('phone_contact_mappings')
      .select(`
        *,
        contacts:contact_id(id, first_name, last_name)
      `);
      
    if (error) {
      throw error;
    }
    
    return data || [];
  };
  
  // Query for contact mappings
  const contactMappings = useQuery({
    queryKey: ['phone_contact_mappings'],
    queryFn: fetchContactMappings,
  });
  
  // Mutation to mark a communication as read
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('communications')
        .update({ read: true })
        .eq('id', id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
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
      const { data, error } = await supabase
        .from('communications')
        .update({ important })
        .eq('id', id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
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
      const { data, error } = await supabase
        .from('phone_contact_mappings')
        .update({ contact_id: contactId })
        .eq('id', id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
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
  
  // Function to initiate a manual sync (dummy function for now - will be replaced with real implementation in the desktop app)
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

      // In the real implementation, this would trigger the desktop app to start syncing
      // For now, we'll just create a sync log entry with the required user_id
      const { error } = await supabase
        .from('communication_sync_logs')
        .insert({
          sync_type: 'manual',
          status: 'in_progress',
          user_id: user.id // Add the user_id field here
        });
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sync initiated',
        description: 'Manual sync has been initiated. The desktop app will now start syncing your communications.',
      });
      
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
          .eq('user_id', user.id); // Add this condition to ensure we update the correct record
          
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
  };
}
