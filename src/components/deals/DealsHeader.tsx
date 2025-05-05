
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  DialogTrigger
} from "@/components/ui/dialog";

interface DealsHeaderProps {
  onAddDeal: () => void;
}

export function DealsHeader({ onAddDeal }: DealsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
        <p className="text-muted-foreground">Manage your sales pipeline and opportunities.</p>
      </div>
      
      <Button onClick={onAddDeal}>
        <Plus className="mr-2 h-4 w-4" />
        Add Deal
      </Button>
    </div>
  );
}
