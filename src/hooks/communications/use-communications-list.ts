
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MultiRowResponse } from '@/types/communicationTypes';

export function useCommunicationsList() {
  const { toast } = useToast();
  const { user } = useAuth();
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
    
    // Focus on single-user mode
    if (user) {
      query = query.eq('user_id', user.id);
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
  
  return {
    communications: communications.data || [],
    isLoadingCommunications: communications.isLoading,
    isErrorCommunications: communications.isError,
    errorCommunications: communications.error,
    searchQuery,
    setSearchQuery,
    filterByType,
    setFilterByType,
    filterByImportance,
    setFilterByImportance,
    markAsRead,
    toggleImportance
  };
}
