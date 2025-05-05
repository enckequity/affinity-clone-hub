
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Upload, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanyForm } from './CompanyForm';
import { BulkImportSheet } from '@/components/common/BulkImportSheet';
import { useToast } from "@/hooks/use-toast";

type CompanyActionsProps = {
  onCompanyAdded: () => void;
};

export function CompanyActions({ onCompanyAdded }: CompanyActionsProps) {
  const [isAddingCompany, setIsAddingCompany] = React.useState(false);
  const { toast } = useToast();
  
  return (
    <div className="flex items-center gap-2">
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
          <CompanyForm onComplete={() => {
            setIsAddingCompany(false);
            toast({
              title: "Company added",
              description: "The company has been successfully added."
            });
            onCompanyAdded();
          }} />
        </DialogContent>
      </Dialog>
      
      <BulkImportSheet 
        entityType="companies"
        onImportComplete={onCompanyAdded}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            toast({
              title: "Export companies",
              description: "Your companies would be exported here."
            });
          }}>
            Export Companies
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            toast({
              title: "Print list",
              description: "The companies list would be printed here."
            });
          }}>
            Print List
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            toast({
              title: "Bulk edit",
              description: "The bulk edit feature would open here."
            });
          }}>
            Bulk Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            toast({
              title: "Bulk delete",
              description: "The bulk delete feature would open here."
            });
          }} className="text-destructive">
            Bulk Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
