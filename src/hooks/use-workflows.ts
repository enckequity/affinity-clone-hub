
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Ensure we convert JSON data to the correct format for Workflow type
      const formattedData = data.map(workflow => ({
        ...workflow,
        trigger_config: typeof workflow.trigger_config === 'string' 
          ? JSON.parse(workflow.trigger_config) 
          : workflow.trigger_config,
        actions: typeof workflow.actions === 'string' 
          ? JSON.parse(workflow.actions) 
          : workflow.actions
      })) as Workflow[];
      
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
      
      return data as Workflow;
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
      
      return data as Workflow;
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
      
      return data as Workflow;
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
      
      return data as Workflow;
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
      
      // 2. Update the workflow's last_run and total_runs
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .update({
          last_run: new Date().toISOString(),
          total_runs: await supabase.rpc('increment_total_runs', { row_id: id })
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (workflowError) throw workflowError;
      
      // In a real application, you would trigger an edge function or background process here
      // For now, we'll simulate a successful run
      
      // 3. Simulate workflow processing
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
      
      return workflowData as Workflow;
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
