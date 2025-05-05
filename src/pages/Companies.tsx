
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
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Users,
  Globe,
  Building2
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CompanyForm } from '@/components/companies/CompanyForm';
import { CompanyDetails } from '@/components/companies/CompanyDetails';

// Sample data for the companies list
const companiesData = [
  {
    id: 1,
    name: 'Acme Inc',
    industry: 'Technology',
    size: '50-100',
    website: 'acmeinc.com',
    contacts: 4,
    deals: 2,
    revenue: '$2.5M',
    location: 'San Francisco, CA',
    tags: ['Customer', 'Enterprise'],
    lastInteraction: '2 days ago',
    avatarInitials: 'AI'
  },
  {
    id: 2,
    name: 'Tech Innovate',
    industry: 'Software',
    size: '10-50',
    website: 'techinnovate.co',
    contacts: 2,
    deals: 1,
    revenue: '$1.2M',
    location: 'Austin, TX',
    tags: ['Customer', 'Startup'],
    lastInteraction: 'Yesterday',
    avatarInitials: 'TI'
  },
  {
    id: 3,
    name: 'Global Finance',
    industry: 'Finance',
    size: '500+',
    website: 'globalfinance.com',
    contacts: 8,
    deals: 3,
    revenue: '$50M+',
    location: 'New York, NY',
    tags: ['Customer', 'Finance'],
    lastInteraction: '1 week ago',
    avatarInitials: 'GF'
  },
  {
    id: 4,
    name: 'XYZ Tech',
    industry: 'Hardware',
    size: '100-500',
    website: 'xyztech.io',
    contacts: 5,
    deals: 0,
    revenue: '$10M+',
    location: 'Boston, MA',
    tags: ['Prospect', 'Manufacturing'],
    lastInteraction: '3 days ago',
    avatarInitials: 'XT'
  },
  {
    id: 5,
    name: 'New Startup',
    industry: 'SaaS',
    size: '1-10',
    website: 'newstartup.co',
    contacts: 1,
    deals: 1,
    revenue: '$0.5M',
    location: 'Seattle, WA',
    tags: ['Lead', 'Startup'],
    lastInteraction: 'Today',
    avatarInitials: 'NS'
  }
];

export default function Companies() {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Manage your organizations and accounts.</p>
        </div>
        
        <Dialog open={isAddingCompany} onOpenChange={setIsAddingCompany}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <CompanyForm onComplete={() => setIsAddingCompany(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search companies..." 
            className="pl-9 w-full" 
          />
        </div>
        
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className="hidden md:table-cell">Industry</TableHead>
              <TableHead className="hidden md:table-cell">Contacts</TableHead>
              <TableHead className="hidden lg:table-cell">Deals</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companiesData.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex items-center gap-3" onClick={() => setSelectedCompany(company.id)}>
                    <Avatar className="h-8 w-8 bg-muted">
                      <AvatarFallback>{company.avatarInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground md:hidden">
                        <Globe className="mr-1 h-3 w-3" />
                        {company.website}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {company.industry}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {company.size}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{company.contacts}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant={company.deals > 0 ? "default" : "outline"} className="text-xs">
                    {company.deals} active
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {company.location}
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
                      <DropdownMenuItem onClick={() => setSelectedCompany(company.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Add Contact</DropdownMenuItem>
                      <DropdownMenuItem>Create Deal</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
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
      
      {selectedCompany && (
        <Dialog open={selectedCompany !== null} onOpenChange={() => setSelectedCompany(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <CompanyDetails 
              company={companiesData.find(c => c.id === selectedCompany)!} 
              onClose={() => setSelectedCompany(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
