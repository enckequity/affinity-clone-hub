import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus,
  Trash2,
  Save,
  CornerDownRight,
  Workflow,
  Play,
  Settings,
  Users,
  Building2,
  DollarSign,
  Bell,
  Mail,
  Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { WorkflowFormData, Workflow as WorkflowType, useWorkflows } from '@/hooks/use-workflows';

// Define trigger types
const triggerTypes = [
  { id: 'new_contact', label: 'New Contact Created', icon: Users },
  { id: 'new_company', label: 'New Company Created', icon: Building2 },
  { id: 'deal_stage_change', label: 'Deal Stage Changed', icon: DollarSign },
  { id: 'inactivity', label: 'Contact Inactivity', icon: Bell },
  { id: 'deal_value_threshold', label: 'Deal Value Threshold', icon: DollarSign },
];

// Define action types
const actionTypes = [
  { id: 'create_task', label: 'Create Task', icon: Plus },
  { id: 'send_notification', label: 'Send Notification', icon: Bell },
  { id: 'send_email', label: 'Send Email', icon: Mail },
  { id: 'tag_record', label: 'Tag Record', icon: Settings },
];

// Define schemas for the form
const workflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  trigger: z.object({
    type: z.string().min(1, 'Trigger type is required'),
    config: z.record(z.any()).optional(),
  }),
  actions: z.array(z.object({
    id: z.string(),
    type: z.string().min(1, 'Action type is required'),
    config: z.record(z.any()).optional(),
  })).min(1, 'At least one action is required'),
});

type FormValues = z.infer<typeof workflowSchema>;

type WorkflowBuilderProps = {
  initialData: WorkflowType | null;
  onSave: (workflow: WorkflowType) => void;
};

export function WorkflowBuilder({ initialData, onSave }: WorkflowBuilderProps) {
  const [actions, setActions] = useState<any[]>([{ id: `action-${Date.now()}`, type: '', config: {} }]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { createWorkflow, updateWorkflow } = useWorkflows();
  
  // Prepare default form values
  const defaultValues: FormValues = initialData ? {
    name: initialData.name,
    description: initialData.description || '',
    trigger: {
      type: initialData.trigger_type,
      config: initialData.trigger_config,
    },
    actions: initialData.actions,
  } : {
    name: '',
    description: '',
    trigger: {
      type: '',
      config: {},
    },
    actions: [{ id: `action-${Date.now()}`, type: '', config: {} }],
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: defaultValues,
  });

  // Update actions when initialData changes
  useEffect(() => {
    if (initialData?.actions) {
      setActions(initialData.actions);
    }
  }, [initialData]);

  const addAction = () => {
    const newAction = { id: `action-${Date.now()}`, type: '', config: {} };
    setActions([...actions, newAction]);
    form.setValue('actions', [...form.getValues().actions, newAction]);
  };

  const removeAction = (index: number) => {
    if (actions.length === 1) {
      toast({
        title: 'Error',
        description: 'Workflow must have at least one action',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedActions = [...actions];
    updatedActions.splice(index, 1);
    setActions(updatedActions);
    form.setValue('actions', updatedActions);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      let result;
      
      // Convert form data to WorkflowFormData
      const workflowData: WorkflowFormData = {
        name: data.name,
        description: data.description,
        trigger: {
          type: data.trigger.type,
          config: data.trigger.config || {},
        },
        actions: data.actions.map(action => ({
          id: action.id,
          type: action.type,
          config: action.config || {},
        })),
      };
      
      if (initialData) {
        // Update existing workflow
        result = await updateWorkflow(initialData.id, workflowData);
      } else {
        // Create new workflow
        result = await createWorkflow(workflowData);
      }
      
      if (result) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      
      toast({
        title: 'Error',
        description: 'There was a problem saving your workflow.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          Workflow Builder
        </CardTitle>
        <CardDescription>
          Automate your CRM processes by creating custom workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Follow up on new leads" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of this workflow" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Trigger</h3>
              <p className="text-sm text-muted-foreground">
                Define when this workflow should run
              </p>
              
              <FormField
                control={form.control}
                name="trigger.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a trigger" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {triggerTypes.map((trigger) => (
                          <SelectItem key={trigger.id} value={trigger.id}>
                            <div className="flex items-center gap-2">
                              <trigger.icon className="h-4 w-4" />
                              {trigger.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('trigger.type') === 'deal_stage_change' && (
                <div className="pl-6 border-l-2 border-muted py-2">
                  <FormField
                    control={form.control}
                    name="trigger.config.fromStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Stage</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="trigger.config.toStage"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>To Stage</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="closed-won">Closed Won</SelectItem>
                            <SelectItem value="closed-lost">Closed Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {form.watch('trigger.type') === 'inactivity' && (
                <div className="pl-6 border-l-2 border-muted py-2">
                  <FormField
                    control={form.control}
                    name="trigger.config.days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days of Inactivity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Trigger when there has been no activity for this many days
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {form.watch('trigger.type') === 'deal_value_threshold' && (
                <div className="pl-6 border-l-2 border-muted py-2">
                  <FormField
                    control={form.control}
                    name="trigger.config.threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Value Threshold ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Trigger when deal value exceeds this amount
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Actions</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addAction}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Action
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Define what should happen when the trigger conditions are met
              </p>
              
              <Accordion type="multiple" defaultValue={[`action-0`]} className="w-full">
                {actions.map((action, index) => (
                  <AccordionItem value={`action-${index}`} key={action.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Action {index + 1}: {
                            actionTypes.find(
                              t => t.id === form.watch(`actions.${index}.type`)
                            )?.label || 'Select an action'
                          }
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                          <FormField
                            control={form.control}
                            name={`actions.${index}.type`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Action Type</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    const updatedActions = [...actions];
                                    updatedActions[index].type = value;
                                    setActions(updatedActions);
                                  }}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an action" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {actionTypes.map((actionType) => (
                                      <SelectItem key={actionType.id} value={actionType.id}>
                                        <div className="flex items-center gap-2">
                                          <actionType.icon className="h-4 w-4" />
                                          {actionType.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            className="ml-2 mt-8"
                            onClick={() => removeAction(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        {form.watch(`actions.${index}.type`) === 'create_task' && (
                          <div className="space-y-4 pl-6 border-l-2 border-muted py-2">
                            <FormField
                              control={form.control}
                              name={`actions.${index}.config.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Task Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="E.g., Follow up with client" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`actions.${index}.config.dueDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Due Date</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="When is this due?" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="same_day">Same Day</SelectItem>
                                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                      <SelectItem value="next_week">Next Week</SelectItem>
                                      <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        
                        {form.watch(`actions.${index}.type`) === 'send_notification' && (
                          <div className="space-y-4 pl-6 border-l-2 border-muted py-2">
                            <FormField
                              control={form.control}
                              name={`actions.${index}.config.message`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notification Message</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Enter notification message..." 
                                      {...field} 
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        
                        {form.watch(`actions.${index}.type`) === 'send_email' && (
                          <div className="space-y-4 pl-6 border-l-2 border-muted py-2">
                            <FormField
                              control={form.control}
                              name={`actions.${index}.config.subject`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Subject</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter email subject..." {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`actions.${index}.config.body`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Body</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Enter email body..." 
                                      {...field} 
                                      rows={5}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        
                        {form.watch(`actions.${index}.type`) === 'tag_record' && (
                          <div className="space-y-4 pl-6 border-l-2 border-muted py-2">
                            <FormField
                              control={form.control}
                              name={`actions.${index}.config.tag`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tag</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a tag" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="follow-up">Follow Up</SelectItem>
                                      <SelectItem value="priority">Priority</SelectItem>
                                      <SelectItem value="at-risk">At Risk</SelectItem>
                                      <SelectItem value="vip">VIP</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="submit" 
                className="flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Workflow
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={isSaving}
                onClick={() => {
                  toast({
                    title: 'Test run initiated',
                    description: 'A test run of the workflow would be executed in a production environment.',
                  });
                }}
              >
                <Play className="h-4 w-4" />
                Test Run
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
