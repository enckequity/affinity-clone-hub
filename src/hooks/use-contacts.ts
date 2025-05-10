
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define response types for type casting
type SingleRowResponse<T> = { data: T | null; error: Error | null };
type MultiRowResponse<T> = { data: T[] | null; error: Error | null };

export function useContacts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchContacts = async () => {
    let query = supabase
      .from('contacts')
      .select(`
        *,
        companies:company_id(id, name)
      `)
      .order('created_at', { ascending: false });
      
    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }
    
    const result = await query as unknown as MultiRowResponse<any>;
    
    if (result.error) {
      throw result.error;
    }
    
    return result.data || [];
  };
  
  const contacts = useQuery({
    queryKey: ['contacts', searchQuery],
    queryFn: fetchContacts,
  });
  
  const createContact = useMutation({
    mutationFn: async (newContact: any) => {
      const result = await supabase
        .from('contacts')
        .insert([newContact])
        .select() as unknown as MultiRowResponse<any>;
        
      if (result.error) {
        throw result.error;
      }
      
      return result.data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Success',
        description: 'Contact created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create contact',
        variant: 'destructive',
      });
    },
  });
  
  const updateContact = useMutation({
    mutationFn: async ({ id, ...contact }: any) => {
      const result = await supabase
        .from('contacts')
        .update(contact)
        .eq('id', id)
        .select() as unknown as MultiRowResponse<any>;
        
      if (result.error) {
        throw result.error;
      }
      
      return result.data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Success',
        description: 'Contact updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update contact',
        variant: 'destructive',
      });
    },
  });
  
  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const result = await supabase
        .from('contacts')
        .delete()
        .eq('id', id) as unknown as { error: Error | null };
        
      if (result.error) {
        throw result.error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete contact',
        variant: 'destructive',
      });
    },
  });
  
  return {
    contacts: contacts.data || [],
    isLoading: contacts.isLoading,
    isError: contacts.isError,
    error: contacts.error,
    searchQuery,
    setSearchQuery,
    createContact,
    updateContact,
    deleteContact,
  };
}
