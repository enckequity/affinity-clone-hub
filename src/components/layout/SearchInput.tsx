
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { 
  Search, 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SearchInput() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Mock search results - in a real app, you'd fetch these dynamically
  const contacts = [
    { id: 'c1', name: 'Sarah Johnson', company: 'Acme Inc', type: 'contact' },
    { id: 'c2', name: 'Michael Brown', company: 'Tech Innovate', type: 'contact' },
    { id: 'c3', name: 'Jessica Smith', company: 'Global Finance', type: 'contact' },
  ];
  
  const companies = [
    { id: 'co1', name: 'Acme Inc', industry: 'Software', type: 'company' },
    { id: 'co2', name: 'Tech Innovate', industry: 'Technology', type: 'company' },
    { id: 'co3', name: 'Global Finance', industry: 'Financial Services', type: 'company' },
  ];
  
  const deals = [
    { id: 'd1', name: 'Enterprise Solution', company: 'Acme Inc', value: '$45,000', type: 'deal' },
    { id: 'd2', name: 'Security Upgrade', company: 'Tech Innovate', value: '$28,000', type: 'deal' },
    { id: 'd3', name: 'Marketing Campaign', company: 'Global Finance', value: '$35,000', type: 'deal' },
  ];
  
  const aiSuggestions = [
    { id: 'ai1', text: 'Show deals closing this month', type: 'ai' },
    { id: 'ai2', text: 'Find contacts I haven\'t reached out to in 30 days', type: 'ai' },
    { id: 'ai3', text: 'Summarize Acme Inc relationship', type: 'ai' },
    { id: 'ai4', text: 'Draft follow-up email to Michael Brown', type: 'ai' },
    { id: 'ai5', text: 'Analyze risk for Enterprise Solution deal', type: 'ai' },
  ];

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (item: any) => {
    setOpen(false);
    
    // Handle different types of items
    if (item.type === 'contact') {
      // In a real app, navigate to the contact or open contact dialog
      console.log('Navigate to contact:', item);
    } else if (item.type === 'company') {
      // In a real app, navigate to the company or open company dialog
      console.log('Navigate to company:', item);
    } else if (item.type === 'deal') {
      // In a real app, navigate to the deal or open deal dialog
      console.log('Navigate to deal:', item);
    } else if (item.type === 'ai') {
      // Navigate to dashboard with AI query
      navigate('/?aiQuery=' + encodeURIComponent(item.text));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center w-full md:w-[300px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <span className="text-muted-foreground">Search... (⌘ K)</span>
      </button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search contacts, companies, deals or ask AI..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Contacts">
            {contacts.map((contact) => (
              <CommandItem
                key={contact.id}
                onSelect={() => handleSelect(contact)}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{contact.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {contact.company}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Companies">
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                onSelect={() => handleSelect(company)}
                className="cursor-pointer"
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span>{company.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {company.industry}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Deals">
            {deals.map((deal) => (
              <CommandItem
                key={deal.id}
                onSelect={() => handleSelect(deal)}
                className="cursor-pointer"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>{deal.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {deal.company} · {deal.value}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Ask AI Assistant">
            {aiSuggestions.map((suggestion) => (
              <CommandItem
                key={suggestion.id}
                onSelect={() => handleSelect(suggestion)}
                className="cursor-pointer"
              >
                <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                <span>{suggestion.text}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
