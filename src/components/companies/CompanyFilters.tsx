
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Sample data for filters
const industries = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "software", label: "Software" },
  { value: "saas", label: "SaaS" },
  { value: "hardware", label: "Hardware" },
];

const sizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "10-50", label: "10-50 employees" },
  { value: "50-100", label: "50-100 employees" },
  { value: "100-500", label: "100-500 employees" },
  { value: "500+", label: "500+ employees" },
];

const tags = [
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "customer", label: "Customer" },
  { value: "partner", label: "Partner" },
  { value: "enterprise", label: "Enterprise" },
  { value: "startup", label: "Startup" },
  { value: "smb", label: "SMB" },
];

export type CompanyFiltersProps = {
  onFiltersChanged: (filters: {
    industry: string[];
    size: string[];
    tag: string[];
  }) => void;
};

export function CompanyFilters({ onFiltersChanged }: CompanyFiltersProps) {
  const [industryOpen, setIndustryOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const handleIndustrySelect = (value: string) => {
    const updated = selectedIndustries.includes(value)
      ? selectedIndustries.filter(i => i !== value)
      : [...selectedIndustries, value];
    
    setSelectedIndustries(updated);
    updateFilters(updated, selectedSizes, selectedTags);
  };
  
  const handleSizeSelect = (value: string) => {
    const updated = selectedSizes.includes(value)
      ? selectedSizes.filter(s => s !== value)
      : [...selectedSizes, value];
    
    setSelectedSizes(updated);
    updateFilters(selectedIndustries, updated, selectedTags);
  };
  
  const handleTagSelect = (value: string) => {
    const updated = selectedTags.includes(value)
      ? selectedTags.filter(t => t !== value)
      : [...selectedTags, value];
    
    setSelectedTags(updated);
    updateFilters(selectedIndustries, selectedSizes, updated);
  };
  
  const updateFilters = (industry: string[], size: string[], tag: string[]) => {
    onFiltersChanged({
      industry,
      size,
      tag
    });
  };
  
  const clearFilters = () => {
    setSelectedIndustries([]);
    setSelectedSizes([]);
    setSelectedTags([]);
    updateFilters([], [], []);
  };
  
  const hasFilters = selectedIndustries.length > 0 || selectedSizes.length > 0 || selectedTags.length > 0;
  
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md bg-background">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Industry filter */}
        <div>
          <label className="text-xs text-muted-foreground">Industry</label>
          <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={industryOpen}
                className="w-full justify-between mt-1 h-8"
              >
                {selectedIndustries.length > 0 
                  ? `${selectedIndustries.length} selected`
                  : "Select industry"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command className="w-full">
                <CommandInput placeholder="Search industry..." />
                <CommandEmpty>No industry found.</CommandEmpty>
                <CommandGroup>
                  {industries.map((industry) => (
                    <CommandItem
                      key={industry.value}
                      value={industry.value}
                      onSelect={() => handleIndustrySelect(industry.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedIndustries.includes(industry.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {industry.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          {selectedIndustries.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedIndustries.map(value => {
                const industry = industries.find(i => i.value === value);
                return (
                  <Badge key={value} variant="outline" className="text-xs">
                    {industry?.label}
                    <button 
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleIndustrySelect(value)}
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Company size filter */}
        <div>
          <label className="text-xs text-muted-foreground">Company Size</label>
          <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={sizeOpen}
                className="w-full justify-between mt-1 h-8"
              >
                {selectedSizes.length > 0 
                  ? `${selectedSizes.length} selected`
                  : "Select company size"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command className="w-full">
                <CommandGroup>
                  {sizes.map((size) => (
                    <CommandItem
                      key={size.value}
                      value={size.value}
                      onSelect={() => handleSizeSelect(size.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSizes.includes(size.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {size.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          {selectedSizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedSizes.map(value => {
                const size = sizes.find(s => s.value === value);
                return (
                  <Badge key={value} variant="outline" className="text-xs">
                    {size?.label}
                    <button 
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSizeSelect(value)}
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Tags filter */}
        <div>
          <label className="text-xs text-muted-foreground">Tags</label>
          <Popover open={tagOpen} onOpenChange={setTagOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={tagOpen}
                className="w-full justify-between mt-1 h-8"
              >
                {selectedTags.length > 0 
                  ? `${selectedTags.length} selected`
                  : "Select tags"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command className="w-full">
                <CommandInput placeholder="Search tags..." />
                <CommandEmpty>No tag found.</CommandEmpty>
                <CommandGroup>
                  {tags.map((tag) => (
                    <CommandItem
                      key={tag.value}
                      value={tag.value}
                      onSelect={() => handleTagSelect(tag.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTags.includes(tag.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {tag.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedTags.map(value => {
                const tag = tags.find(t => t.value === value);
                return (
                  <Badge key={value} variant="outline" className="text-xs">
                    {tag?.label}
                    <button 
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleTagSelect(value)}
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

