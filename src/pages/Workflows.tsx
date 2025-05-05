
import React, { useState } from 'react';
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
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Workflow, 
  Play,
  Pause,
  MoreHorizontal,
  Edit,
  Trash,
  Copy
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

// Sample data for the workflows list
const workflowsData = [
  {
    id: 1,
    name: 'New Lead Follow-up',
    description: 'Automatically follow up with new leads within 24 hours',
    trigger: 'New Contact Created',
    actions: ['Create Task', 'Send Email'],
    status: 'active',
    lastRun: '2 hours ago',
    totalRuns: 42
  },
  {
    id: 2,
    name: 'Deal Stage Notification',
    description: 'Notify team when a deal moves to negotiation stage',
    trigger: 'Deal Stage Changed',
    actions: ['Send Notification'],
    status: 'active',
    lastRun: 'Yesterday',
    totalRuns: 18
  },
  {
    id: 3,
    name: 'High Value Deal Alert',
    description: 'Alert managers for deals over $50,000',
    trigger: 'Deal Value Threshold',
    actions: ['Send Notification', 'Tag Record'],
    status: 'inactive',
    lastRun: '1 week ago',
    totalRuns: 5
  },
  {
    id: 4,
    name: 'Customer Inactivity Reminder',
    description: 'Remind team to check in with inactive customers',
    trigger: 'Contact Inactivity',
    actions: ['Create Task', 'Send Email'],
    status: 'active',
    lastRun: '3 days ago',
    totalRuns: 28
  },
  {
    id: 5,
    name: 'Welcome Sequence',
    description: 'Send welcome emails to new contacts',
    trigger: 'New Contact Created',
    actions: ['Send Email', 'Create Task', 'Tag Record'],
    status: 'active',
    lastRun: 'Today',
    totalRuns: 103
  }
];

export default function Workflows() {
  const [isAddingWorkflow, setIsAddingWorkflow] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);

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
            <WorkflowBuilder />
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
          />
        </div>
      </div>
      
      <div className="bg-white rounded-md border">
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
            {workflowsData.map((workflow) => (
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
                  {workflow.trigger}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {workflow.actions.map((action, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {action}
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
                  {workflow.lastRun}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right text-sm">
                  {workflow.totalRuns}
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Workflow
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Run Now
                      </DropdownMenuItem>
                      <DropdownMenuItem>
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
                      <DropdownMenuItem className="text-destructive">
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
      </div>
    </div>
  );
}
