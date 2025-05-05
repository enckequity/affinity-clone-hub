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
  XCircle,
  Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { DealForm } from './DealForm';
import { AIRelationshipSummary } from '../ai/AIRelationshipSummary';
import { AlertTriangle } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="ai-insights">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Insights
            </span>
          </TabsTrigger>
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
        
        <TabsContent value="ai-insights" className="mt-6">
          <div className="space-y-6">
            <AIRelationshipSummary 
              entityType="deal"
              entityData={{
                name: deal.name,
                company: deal.company,
                stage: deal.stage,
                stageLabel: deal.stageLabel,
                value: deal.value,
                expectedCloseDate: deal.expectedCloseDate,
                probability: deal.probability,
              }}
              interactionHistory="Last updated 5 days ago. Proposal sent 2 weeks ago. Initial discovery call 1 month ago."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">AI Deal Health Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Overall Health</span>
                      <span className="text-xs font-bold">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Engagement Level</span>
                      <span className="text-xs font-bold">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Champion Relationship</span>
                      <span className="text-xs font-bold">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Decision Maker Access</span>
                      <span className="text-xs font-bold">45%</span>
                    </div>
                    <Progress value={45} className="h-2 bg-red-100" />
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                  <div className="flex items-center gap-1 font-medium mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Attention Required
                  </div>
                  <p>This deal lacks sufficient engagement with key decision makers. Consider requesting a meeting with the CTO who will need to sign off on this proposal.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">AI-Suggested Next Actions</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Request meeting with CTO</p>
                      <p className="text-xs text-muted-foreground">Suggested timing: This week</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Send ROI calculator</p>
                      <p className="text-xs text-muted-foreground">Helps justify investment to finance team</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Offer technical demo to IT team</p>
                      <p className="text-xs text-muted-foreground">Address implementation concerns early</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium mt-4">Winning Strategy</h3>
                <div className="bg-muted/30 p-3 rounded-md text-sm">
                  <p>This deal is in the proposal stage with moderate engagement. To increase success probability:</p>
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    <li>Expand relationships beyond current champion</li>
                    <li>Quantify ROI more specifically for their industry</li>
                    <li>Address competitive comparisons proactively</li>
                    <li>Propose phased implementation to reduce perceived risk</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
