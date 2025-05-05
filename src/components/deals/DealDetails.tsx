
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { 
  Building2, 
  FileText, 
  Calendar, 
  MessageSquare,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  BarChart3,
  User,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { DealForm } from './DealForm';

interface DealDetailsProps {
  deal: any;
  onClose: () => void;
}

export function DealDetails({ deal, onClose }: DealDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
        </DialogHeader>
        <DealForm 
          existingDeal={deal} 
          onComplete={() => setIsEditing(false)} 
        />
      </>
    );
  }
  
  let stageColor = 'bg-orange-500';
  if (deal.stage === 'qualified') stageColor = 'bg-yellow-500';
  if (deal.stage === 'proposal') stageColor = 'bg-blue-500';
  if (deal.stage === 'negotiation') stageColor = 'bg-purple-500';
  if (deal.stage === 'closed-won') stageColor = 'bg-green-500';
  if (deal.stage === 'closed-lost') stageColor = 'bg-red-500';
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${stageColor}`}></div>
              <Badge className={stageColor}>{deal.stageLabel}</Badge>
            </div>
            <DialogTitle className="text-xl mb-1">{deal.name}</DialogTitle>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {deal.company}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsEditing(true)} 
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>
      
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Deal Information</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Value: ${deal.value.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Expected Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Owner: {deal.owner}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last Updated: {deal.lastUpdated}</span>
                </div>
                
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>Probability: {deal.probability}%</span>
                    </div>
                    <span className="text-xs font-medium">{deal.probability}%</span>
                  </div>
                  <Progress value={deal.probability} className="h-1.5" />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Pipeline Progress</h3>
                <div className="flex w-full">
                  <div className={`h-2 flex-1 bg-orange-500 rounded-l-full ${deal.stage !== 'lead' && 'opacity-30'}`}></div>
                  <div className={`h-2 flex-1 bg-yellow-500 ${deal.stage !== 'qualified' && 'opacity-30'}`}></div>
                  <div className={`h-2 flex-1 bg-blue-500 ${deal.stage !== 'proposal' && 'opacity-30'}`}></div>
                  <div className={`h-2 flex-1 bg-purple-500 ${deal.stage !== 'negotiation' && 'opacity-30'}`}></div>
                  <div className={`h-2 flex-1 bg-green-500 rounded-r-full ${deal.stage !== 'closed-won' && 'opacity-30'}`}></div>
                </div>
                <div className="flex w-full text-xs justify-between mt-1">
                  <span>Lead</span>
                  <span>Qualified</span>
                  <span>Proposal</span>
                  <span>Negotiation</span>
                  <span>Closed</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Company Information</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{deal.companyAvatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{deal.company}</p>
                    <div className="flex gap-1 text-xs text-muted-foreground">
                      <span>2 contacts</span>
                      <span>•</span>
                      <span>1 active deal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Description</h3>
              <div className="bg-muted/30 p-3 rounded-md text-sm">
                <p>Looking to upgrade their Enterprise license to include additional modules for their marketing and analytics teams. Initial discussions have been positive and they're very interested in the new features.</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Next Steps</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">Schedule product demo</p>
                      <p className="text-xs text-muted-foreground">Due tomorrow</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm">Send pricing proposal</p>
                      <p className="text-xs text-destructive">Overdue by 2 days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">Get stakeholder approval</p>
                      <p className="text-xs text-muted-foreground">Due in 5 days</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Key Contacts</h3>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View all
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">VP of Operations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>MB</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Mike Brown</p>
                      <p className="text-xs text-muted-foreground">CTO</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Activity Timeline</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  Log Activity
                </Button>
              </div>
            </div>
            
            <div className="pb-4">
              <RecentActivities />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
