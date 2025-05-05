
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export type Workflow = {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, any>;
  actions: Array<{
    id: string;
    type: string;
    config: Record<string, any>;
  }>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  last_run: string | null;
  total_runs: number;
};

export type WorkflowFormData = {
  name: string;
  description?: string;
  trigger: {
    type: string;
    config: Record<string, any>;
  };
  actions: Array<{
    id: string;
    type: string;
    config: Record<string, any>;
  }>;
};

// Helper function to safely parse JSON or return a default value
const safeJsonParse = <T>(jsonValue: Json, defaultValue: T): T => {
  if (typeof jsonValue === 'string') {
    try {
      return JSON.parse(jsonValue) as T;
    } catch (e) {
      return defaultValue;
    }
  }
  
  if (jsonValue === null || jsonValue === undefined) {
    return defaultValue;
  }
  
  return jsonValue as unknown as T;
};

export const useWorkflows = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert JSON data to the correct type format for Workflow type
      const formattedData = data.map(workflow => {
        return {
          ...workflow,
          trigger_config: safeJsonParse<Record<string, any>>(workflow.trigger_config, {}),
          actions: safeJsonParse<Array<{id: string; type: string; config: Record<string, any>}>>(workflow.actions, [])
        } as Workflow;
      });
      
      setWorkflows(formattedData);
    } catch (error: any) {
      console.error('Error fetching workflows:', error);
      toast({
        title: 'Error fetching workflows',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkflow = async (formData: WorkflowFormData) => {
    setIsLoading(true);
    try {
      // Get the current user's ID
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          name: formData.name,
          description: formData.description,
          trigger_type: formData.trigger.type,
          trigger_config: formData.trigger.config,
          actions: formData.actions,
          status: 'inactive',
          created_by: userData.user.id
        })
        .select('*')
        .single();

      if (error) throw error;
      
      toast({
        title: 'Workflow created',
        description: 'Your workflow has been created successfully.',
      });
      
      // Cast data to Workflow type with proper parsing
      return {
        ...data,
        trigger_config: safeJsonParse<Record<string, any>>(data.trigger_config, {}),
        actions: safeJsonParse<Array<{id: string; type: string; config: Record<string, any>}>>(data.actions, [])
      } as Workflow;
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      toast({
        title: 'Error creating workflow',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkflow = async (id: string, formData: WorkflowFormData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflows')
        .update({
          name: formData.name,
          description: formData.description,
          trigger_type: formData.trigger.type,
          trigger_config: formData.trigger.config,
          actions: formData.actions,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      
      toast({
        title: 'Workflow updated',
        description: 'Your workflow has been updated successfully.',
      });
      
      // Cast data to Workflow type with proper parsing
      return {
        ...data,
        trigger_config: safeJsonParse<Record<string, any>>(data.trigger_config, {}),
        actions: safeJsonParse<Array<{id: string; type: string; config: Record<string, any>}>>(data.actions, [])
      } as Workflow;
    } catch (error: any) {
      console.error('Error updating workflow:', error);
      toast({
        title: 'Error updating workflow',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Workflow deleted',
        description: 'The workflow has been deleted successfully.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Error deleting workflow',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const duplicateWorkflow = async (workflow: Workflow) => {
    setIsLoading(true);
    try {
      // Get the current user's ID
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { id, created_at, updated_at, last_run, total_runs, ...workflowData } = workflow;
      
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          ...workflowData,
          name: `${workflowData.name} (Copy)`,
          status: 'inactive',
          created_by: userData.user.id
        })
        .select('*')
        .single();

      if (error) throw error;
      
      toast({
        title: 'Workflow duplicated',
        description: 'The workflow has been duplicated successfully.',
      });
      
      // Cast data to Workflow type with proper parsing
      return {
        ...data,
        trigger_config: safeJsonParse<Record<string, any>>(data.trigger_config, {}),
        actions: safeJsonParse<Array<{id: string; type: string; config: Record<string, any>}>>(data.actions, [])
      } as Workflow;
    } catch (error: any) {
      console.error('Error duplicating workflow:', error);
      toast({
        title: 'Error duplicating workflow',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkflowStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { data, error } = await supabase
        .from('workflows')
        .update({ status: newStatus })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      
      toast({
        title: `Workflow ${newStatus === 'active' ? 'activated' : 'paused'}`,
        description: `The workflow has been ${newStatus === 'active' ? 'activated' : 'paused'} successfully.`,
      });
      
      // Cast data to Workflow type with proper parsing
      return {
        ...data,
        trigger_config: safeJsonParse<Record<string, any>>(data.trigger_config, {}),
        actions: safeJsonParse<Array<{id: string; type: string; config: Record<string, any>}>>(data.actions, [])
      } as Workflow;
    } catch (error: any) {
      console.error('Error toggling workflow status:', error);
      toast({
        title: 'Error updating workflow',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const runWorkflow = async (id: string) => {
    try {
      // 1. Create a run record
      const { data: runData, error: runError } = await supabase
        .from('workflow_runs')
        .insert({
          workflow_id: id,
          status: 'running'
        })
        .select('*')
        .single();
        
      if (runError) throw runError;
      
      // 2. Update the workflow's last_run
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .update({
          last_run: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (workflowError) throw workflowError;

      // 3. Update total_runs using a separate query since rpc is not working properly
      const { error: updateError } = await supabase
        .from('workflows')
        .update({
          total_runs: workflowData.total_runs + 1
        })
        .eq('id', id);
        
      if (updateError) throw updateError;
      
      // 4. Simulate workflow processing
      setTimeout(async () => {
        await supabase
          .from('workflow_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            results: { success: true, message: 'Workflow executed successfully' }
          })
          .eq('id', runData.id);
      }, 3000);
      
      toast({
        title: 'Workflow running',
        description: 'The workflow has been triggered and is now running.',
      });
      
      // Cast data to Workflow type with proper parsing
      return {
        ...workflowData,
        trigger_config: safeJsonParse<Record<string, any>>(workflowData.trigger_config, {}),
        actions: safeJsonParse<Array<{id: string; type: string; config: Record<string, any>}>>(workflowData.actions, [])
      } as Workflow;
    } catch (error: any) {
      console.error('Error running workflow:', error);
      toast({
        title: 'Error running workflow',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    workflows,
    isLoading,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    toggleWorkflowStatus,
    runWorkflow
  };
};
