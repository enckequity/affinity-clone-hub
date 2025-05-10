
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MultiRowResponse } from '@/types/communicationTypes';

export function useContactMappings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  return {
    contactMappings: contactMappings.data || [],
    isLoadingContactMappings: contactMappings.isLoading,
    isErrorContactMappings: contactMappings.isError,
    errorContactMappings: contactMappings.error,
    updateContactMapping,
  };
}
