
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  Filter,
  MoreHorizontal,
  DollarSign,
  Calendar,
  Building2,
  User,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DealForm } from '@/components/deals/DealForm';
import { DealDetails } from '@/components/deals/DealDetails';
import { DealCard } from '@/components/deals/DealCard';

// Sample data for the deals
const dealsData = {
  lead: [
    {
      id: 1,
      name: 'Software Upgrade',
      company: 'Acme Inc',
      value: 15000,
      stage: 'lead',
      stageLabel: 'Lead',
      expectedCloseDate: '2023-10-15',
      owner: 'John Doe',
      ownerAvatar: 'JD',
      companyAvatar: 'AI',
      probability: 20,
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      name: 'Data Consulting',
      company: 'Tech Innovate',
      value: 8500,
      stage: 'lead',
      stageLabel: 'Lead',
      expectedCloseDate: '2023-09-30',
      owner: 'Sarah Johnson',
      ownerAvatar: 'SJ',
      companyAvatar: 'TI',
      probability: 15,
      lastUpdated: '1 week ago'
    }
  ],
  qualified: [
    {
      id: 3,
      name: 'Marketing Campaign',
      company: 'Global Finance',
      value: 25000,
      stage: 'qualified',
      stageLabel: 'Qualified',
      expectedCloseDate: '2023-11-10',
      owner: 'John Doe',
      ownerAvatar: 'JD',
      companyAvatar: 'GF',
      probability: 35,
      lastUpdated: 'Yesterday'
    },
    {
      id: 4,
      name: 'Security Audit',
      company: 'New Startup',
      value: 12000,
      stage: 'qualified',
      stageLabel: 'Qualified',
      expectedCloseDate: '2023-10-05',
      owner: 'Mike Williams',
      ownerAvatar: 'MW',
      companyAvatar: 'NS',
      probability: 40,
      lastUpdated: '3 days ago'
    }
  ],
  proposal: [
    {
      id: 5,
      name: 'Enterprise License',
      company: 'Acme Inc',
      value: 48000,
      stage: 'proposal',
      stageLabel: 'Proposal',
      expectedCloseDate: '2023-09-15',
      owner: 'John Doe',
      ownerAvatar: 'JD',
      companyAvatar: 'AI',
      probability: 60,
      lastUpdated: '5 days ago'
    }
  ],
  negotiation: [
    {
      id: 6,
      name: 'Custom Development',
      company: 'XYZ Tech',
      value: 75000,
      stage: 'negotiation',
      stageLabel: 'Negotiation',
      expectedCloseDate: '2023-08-30',
      owner: 'Sarah Johnson',
      ownerAvatar: 'SJ',
      companyAvatar: 'XT',
      probability: 80,
      lastUpdated: 'Today'
    }
  ],
  'closed-won': [
    {
      id: 7,
      name: 'Staff Augmentation',
      company: 'Global Finance',
      value: 35000,
      stage: 'closed-won',
      stageLabel: 'Closed Won',
      expectedCloseDate: '2023-08-01',
      owner: 'Mike Williams',
      ownerAvatar: 'MW',
      companyAvatar: 'GF',
      probability: 100,
      lastUpdated: '2 weeks ago'
    }
  ],
  'closed-lost': [
    {
      id: 8,
      name: 'Hardware Upgrade',
      company: 'Tech Innovate',
      value: 18000,
      stage: 'closed-lost',
      stageLabel: 'Closed Lost',
      expectedCloseDate: '2023-07-15',
      owner: 'John Doe',
      ownerAvatar: 'JD',
      companyAvatar: 'TI',
      probability: 0,
      lastUpdated: '3 weeks ago'
    }
  ]
};

// Flatten deals for list view
const allDeals = Object.values(dealsData).flat();

export default function Deals() {
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Manage your sales pipeline and opportunities.</p>
        </div>
        
        <Dialog open={isAddingDeal} onOpenChange={setIsAddingDeal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <DealForm onComplete={() => setIsAddingDeal(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search deals..." 
              className="pl-9 md:w-[300px]" 
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="kanban" className="w-[200px]" onValueChange={(v) => setViewMode(v as 'kanban' | 'list')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <h3 className="font-medium">Lead</h3>
              </div>
              <Badge variant="outline">{dealsData.lead.length}</Badge>
            </div>
            
            {dealsData.lead.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onClick={() => setSelectedDeal(deal.id)} 
              />
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <h3 className="font-medium">Qualified</h3>
              </div>
              <Badge variant="outline">{dealsData.qualified.length}</Badge>
            </div>
            
            {dealsData.qualified.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onClick={() => setSelectedDeal(deal.id)} 
              />
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="font-medium">Proposal</h3>
              </div>
              <Badge variant="outline">{dealsData.proposal.length}</Badge>
            </div>
            
            {dealsData.proposal.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onClick={() => setSelectedDeal(deal.id)} 
              />
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <h3 className="font-medium">Negotiation</h3>
              </div>
              <Badge variant="outline">{dealsData.negotiation.length}</Badge>
            </div>
            
            {dealsData.negotiation.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onClick={() => setSelectedDeal(deal.id)} 
              />
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 className="font-medium">Closed Won</h3>
              </div>
              <Badge variant="outline">{dealsData['closed-won'].length}</Badge>
            </div>
            
            {dealsData['closed-won'].map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onClick={() => setSelectedDeal(deal.id)} 
              />
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h3 className="font-medium">Closed Lost</h3>
              </div>
              <Badge variant="outline">{dealsData['closed-lost'].length}</Badge>
            </div>
            
            {dealsData['closed-lost'].map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onClick={() => setSelectedDeal(deal.id)} 
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <div className="font-medium">{deal.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{deal.companyAvatar}</AvatarFallback>
                      </Avatar>
                      <span>{deal.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        deal.stage === 'lead' ? 'bg-orange-500' :
                        deal.stage === 'qualified' ? 'bg-yellow-500' :
                        deal.stage === 'proposal' ? 'bg-blue-500' :
                        deal.stage === 'negotiation' ? 'bg-purple-500' :
                        deal.stage === 'closed-won' ? 'bg-green-500' :
                        'bg-red-500'
                      }
                    >
                      {deal.stageLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>${deal.value.toLocaleString()}</TableCell>
                  <TableCell>{new Date(deal.expectedCloseDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{deal.ownerAvatar}</AvatarFallback>
                      </Avatar>
                      <span>{deal.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => setSelectedDeal(deal.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {selectedDeal && (
        <Dialog open={selectedDeal !== null} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DealDetails 
              deal={allDeals.find(d => d.id === selectedDeal)!} 
              onClose={() => setSelectedDeal(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
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
