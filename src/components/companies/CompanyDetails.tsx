
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  Calendar, 
  MessageSquare,
  Edit,
  Trash2,
  Clock,
  User,
  MapPin,
  Globe,
  Users,
  Briefcase,
  DollarSign,
  Plus,
  Upload,
  Download
} from "lucide-react";
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { CompanyForm } from './CompanyForm';
import { useToast } from '@/hooks/use-toast';
import { LogActivityDialog } from '@/components/activities/LogActivityDialog';
import { AddNoteDialog } from '@/components/activities/AddNoteDialog';

interface CompanyDetailsProps {
  company: any;
  onClose: () => void;
}

export function CompanyDetails({ company, onClose }: CompanyDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();
  
  const handleDeleteCompany = () => {
    toast({
      title: "Company deleted",
      description: "The company has been successfully deleted."
    });
    onClose();
  };
  
  const handleAddContact = () => {
    toast({
      title: "Adding contact",
      description: "Feature will be implemented soon."
    });
  };
  
  if (isEditing) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>
        <CompanyForm 
          existingCompany={company} 
          onComplete={() => setIsEditing(false)} 
        />
      </>
    );
  }
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-muted">
              <AvatarFallback className="text-lg">{company.avatarInitials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl mb-1">{company.name}</DialogTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                  {company.website}
                </a>
              </div>
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
              onClick={handleDeleteCompany}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>
      
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Company Information</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{company.industry} • {company.size} employees</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{company.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                    {company.website}
                  </a>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Annual Revenue: {company.revenue}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Relationship Summary</h3>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{company.contacts} contacts</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{company.deals} active deals</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last contacted: {company.lastInteraction}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notes</h3>
              <div className="bg-muted/30 p-3 rounded-md text-sm">
                <p>Customer since 2020. They are currently using our enterprise plan with 50 user licenses. Renewal coming up in Q4 2023. Main point of contact is Sarah Johnson, VP of Operations.</p>
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
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Alex Thompson</p>
                      <p className="text-xs text-muted-foreground">Procurement Manager</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Recent Activity</h3>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View all
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Mail className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">Email to Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Phone className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm">Call with Mike Brown</p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <FileText className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm">Shared product roadmap</p>
                      <p className="text-xs text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contacts" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Company Contacts</h3>
              <Button size="sm" onClick={handleAddContact}>
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                        <span>Sarah Johnson</span>
                      </div>
                    </TableCell>
                    <TableCell>VP of Operations</TableCell>
                    <TableCell>s.johnson@example.com</TableCell>
                    <TableCell>+1 (555) 123-4567</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>MB</AvatarFallback>
                        </Avatar>
                        <span>Mike Brown</span>
                      </div>
                    </TableCell>
                    <TableCell>CTO</TableCell>
                    <TableCell>m.brown@example.com</TableCell>
                    <TableCell>+1 (555) 987-6543</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>AT</AvatarFallback>
                        </Avatar>
                        <span>Alex Thompson</span>
                      </div>
                    </TableCell>
                    <TableCell>Procurement Manager</TableCell>
                    <TableCell>a.thompson@example.com</TableCell>
                    <TableCell>+1 (555) 765-4321</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="deals" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Company Deals</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Deal
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">License Expansion</div>
                    </TableCell>
                    <TableCell>$25,000</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500">Qualified</Badge>
                    </TableCell>
                    <TableCell>Sep 30, 2023</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">John Doe</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Enterprise Agreement</div>
                    </TableCell>
                    <TableCell>$75,000</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500">Proposal</Badge>
                    </TableCell>
                    <TableCell>Nov 15, 2023</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">John Doe</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Activity Timeline</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsAddingNote(true)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsLoggingActivity(true)}>
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

      <LogActivityDialog 
        open={isLoggingActivity} 
        onOpenChange={setIsLoggingActivity}
        entityId={company.id}
        entityType="company"
      />

      <AddNoteDialog
        open={isAddingNote}
        onOpenChange={setIsAddingNote}
        entityId={company.id}
        entityType="company"
      />
    </>
  );
}

// Import Table components within the same file since they're only used here
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
