
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

export function SearchInput() {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        type="search" 
        placeholder="Search..." 
        className="w-full md:w-[300px] pl-9"
      />
    </div>
  );
}
