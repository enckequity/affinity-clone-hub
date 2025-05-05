
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Workflow, 
  Play,
  Pause,
  MoreHorizontal,
  Edit,
  Trash,
  Copy,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { WorkflowBuilder } from '@/components/automation/WorkflowBuilder';
import { Workflow as WorkflowType, useWorkflows } from '@/hooks/use-workflows';
import { useToast } from '@/hooks/use-toast';

export default function Workflows() {
  const [isAddingWorkflow, setIsAddingWorkflow] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  
  const { 
    workflows, 
    isLoading, 
    fetchWorkflows, 
    deleteWorkflow, 
    duplicateWorkflow, 
    toggleWorkflowStatus,
    runWorkflow
  } = useWorkflows();

  const { toast } = useToast();
  
  // Filter workflows based on search term
  const filteredWorkflows = searchTerm 
    ? workflows.filter(workflow => 
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.trigger_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : workflows;
  
  // Fetch workflows on component mount
  useEffect(() => {
    fetchWorkflows();
  }, []);
  
  // Handle workflow deletion
  const handleDeleteWorkflow = async () => {
    if (!workflowToDelete) return;
    
    const success = await deleteWorkflow(workflowToDelete);
    if (success) {
      setWorkflowToDelete(null);
      fetchWorkflows();
    }
  };
  
  // Handle workflow duplication
  const handleDuplicateWorkflow = async (workflow: WorkflowType) => {
    const newWorkflow = await duplicateWorkflow(workflow);
    if (newWorkflow) {
      fetchWorkflows();
    }
  };
  
  // Handle workflow status toggle
  const handleToggleStatus = async (workflow: WorkflowType) => {
    const updatedWorkflow = await toggleWorkflowStatus(workflow.id, workflow.status);
    if (updatedWorkflow) {
      fetchWorkflows();
    }
  };
  
  // Handle workflow execution
  const handleRunWorkflow = async (id: string) => {
    setIsExecuting(id);
    const result = await runWorkflow(id);
    setIsExecuting(null);
    
    if (result) {
      fetchWorkflows();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Automate your CRM processes with custom workflows.</p>
        </div>
        
        <Dialog open={isAddingWorkflow} onOpenChange={setIsAddingWorkflow}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            <WorkflowBuilder 
              initialData={null}
              onSave={(data) => {
                setIsAddingWorkflow(false);
                fetchWorkflows();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search workflows..." 
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-md border">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Workflow className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No workflows found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try a different search term or' : 'Start by'} creating your first workflow.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => setIsAddingWorkflow(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead className="hidden md:table-cell">Trigger</TableHead>
                <TableHead className="hidden md:table-cell">Actions</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last Run</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Total Runs</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Workflow className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        <p className="text-xs text-muted-foreground hidden md:block">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {workflow.trigger_type}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {workflow.actions.map((action, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {action.type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge 
                      variant={workflow.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {workflow.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {workflow.last_run ? new Date(workflow.last_run).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right text-sm">
                    {workflow.total_runs}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Workflow
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                              <DialogTitle>Edit Workflow</DialogTitle>
                            </DialogHeader>
                            <WorkflowBuilder 
                              initialData={workflow}
                              onSave={() => fetchWorkflows()}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <DropdownMenuItem onClick={() => handleDuplicateWorkflow(workflow)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleRunWorkflow(workflow.id)}
                          disabled={isExecuting === workflow.id}
                        >
                          {isExecuting === workflow.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          Run Now
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleToggleStatus(workflow)}>
                          {workflow.status === 'active' ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Workflow
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate Workflow
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setWorkflowToDelete(workflow.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Confirmation dialog for workflow deletion */}
      <AlertDialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWorkflow}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
