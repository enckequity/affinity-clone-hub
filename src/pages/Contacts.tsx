
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
import { ContactForm } from '@/components/contacts/ContactForm';
import { ContactDetails } from '@/components/contacts/ContactDetails';

// Sample data for the contacts list
const contactsData = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Inc',
    tags: ['Customer', 'Decision Maker'],
    lastInteraction: '2 days ago',
    avatarInitials: 'JS'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@techinnovate.co',
    phone: '+1 (555) 987-6543',
    company: 'Tech Innovate',
    tags: ['Prospect', 'Technical'],
    lastInteraction: 'Yesterday',
    avatarInitials: 'SJ'
  },
  {
    id: 3,
    name: 'Michael Wong',
    email: 'm.wong@globalfinance.com',
    phone: '+1 (555) 222-3333',
    company: 'Global Finance',
    tags: ['Customer', 'Finance'],
    lastInteraction: '1 week ago',
    avatarInitials: 'MW'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@xyztech.io',
    phone: '+1 (555) 444-5555',
    company: 'XYZ Tech',
    tags: ['Prospect', 'Marketing'],
    lastInteraction: '3 days ago',
    avatarInitials: 'ED'
  },
  {
    id: 5,
    name: 'David Rodriguez',
    email: 'd.rodriguez@newstartup.co',
    phone: '+1 (555) 777-8888',
    company: 'New Startup',
    tags: ['Lead', 'CEO'],
    lastInteraction: 'Today',
    avatarInitials: 'DR'
  }
];

export default function Contacts() {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your contacts and relationships.</p>
        </div>
        
        <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <ContactForm onComplete={() => setIsAddingContact(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search contacts..." 
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
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead className="hidden lg:table-cell">Tags</TableHead>
              <TableHead className="hidden lg:table-cell">Last Interaction</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactsData.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-3" onClick={() => setSelectedContact(contact.id)}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{contact.avatarInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {contact.company}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-xs">
                      <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                      {contact.email}
                    </div>
                    <div className="flex items-center text-xs">
                      <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                      {contact.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <span>{contact.company}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {contact.lastInteraction}
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
                      <DropdownMenuItem onClick={() => setSelectedContact(contact.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Add Note</DropdownMenuItem>
                      <DropdownMenuItem>Add to Deal</DropdownMenuItem>
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
      
      {selectedContact && (
        <Dialog open={selectedContact !== null} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <ContactDetails 
              contact={contactsData.find(c => c.id === selectedContact)!} 
              onClose={() => setSelectedContact(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
