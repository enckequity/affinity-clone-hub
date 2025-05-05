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
} from "@/components/ui/dialog";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Search, 
  Filter,
  MoreHorizontal,
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
import { CompanyDetails } from '@/components/companies/CompanyDetails';
import { CompanyFilters } from '@/components/companies/CompanyFilters';
import { CompanyActions } from '@/components/companies/CompanyActions';
import { useToast } from "@/hooks/use-toast";

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
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    industry: string[];
    size: string[];
    tag: string[];
  }>({
    industry: [],
    size: [],
    tag: []
  });
  const { toast } = useToast();
  
  const handleFiltersChanged = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
    
    if (Object.values(filters).some(arr => arr.length > 0)) {
      toast({
        title: "Filters applied",
        description: "The companies list has been filtered according to your criteria."
      });
    }
  };
  
  const handleCompanyAdded = () => {
    // In a real app, this would refresh the companies list
    toast({
      title: "Companies updated",
      description: "The companies list has been updated."
    });
  };
  
  // Filter the companies based on search query and filters
  const filteredCompanies = companiesData.filter(company => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Industry filter
    const matchesIndustry = activeFilters.industry.length === 0 || 
      activeFilters.industry.some(i => 
        company.industry.toLowerCase() === i.toLowerCase()
      );
      
    // Size filter
    const matchesSize = activeFilters.size.length === 0 || 
      activeFilters.size.includes(company.size);
      
    // Tags filter
    const matchesTags = activeFilters.tag.length === 0 || 
      activeFilters.tag.some(t => 
        company.tags.some(tag => tag.toLowerCase() === t.toLowerCase())
      );
      
    return matchesSearch && matchesIndustry && matchesSize && matchesTags;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Manage your organizations and accounts.</p>
        </div>
        
        <CompanyActions onCompanyAdded={handleCompanyAdded} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search companies..." 
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className={activeFilters.industry.length > 0 || 
                activeFilters.size.length > 0 || 
                activeFilters.tag.length > 0 ? "bg-primary text-primary-foreground" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 overflow-y-auto">
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-medium">Filter Companies</h3>
              <p className="text-sm text-muted-foreground">
                Narrow down your companies list by applying filters.
              </p>
            </div>
            <CompanyFilters onFiltersChanged={handleFiltersChanged} />
          </SheetContent>
        </Sheet>
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
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Building2 className="h-8 w-8 mb-2" />
                    <p className="font-medium">No companies found</p>
                    <p className="text-sm">
                      {searchQuery || Object.values(activeFilters).some(arr => arr.length > 0) 
                        ? "Try changing your search or filters"
                        : "Add your first company to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div 
                      className="flex items-center gap-3 cursor-pointer" 
                      onClick={() => setSelectedCompany(company.id)}
                    >
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
                        <DropdownMenuItem onClick={() => {
                          toast({
                            title: "Edit company",
                            description: "The company edit form would open here."
                          });
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toast({
                            title: "Add contact",
                            description: "The add contact form would open here."
                          });
                        }}>
                          Add Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toast({
                            title: "Create deal",
                            description: "The create deal form would open here."
                          });
                        }}>
                          Create Deal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            toast({
                              title: "Delete company",
                              description: "The company would be deleted here."
                            });
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
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
