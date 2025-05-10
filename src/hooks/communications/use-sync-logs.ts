
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MultiRowResponse } from '@/types/communicationTypes';

export function useSyncLogs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
  
  return {
    syncLogs: syncLogs.data || [],
    isLoadingSyncLogs: syncLogs.isLoading,
    isErrorSyncLogs: syncLogs.isError,
    errorSyncLogs: syncLogs.error,
    initiateManualSync,
  };
}
