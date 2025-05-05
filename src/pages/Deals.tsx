
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { DealForm } from '@/components/deals/DealForm';
import { DealDetails } from '@/components/deals/DealDetails';
import { DealsHeader } from '@/components/deals/DealsHeader';
import { DealsFilters } from '@/components/deals/DealsFilters';
import { KanbanView } from '@/components/deals/KanbanView';
import { ListView } from '@/components/deals/ListView';
import { useDealData } from '@/hooks/use-deal-data';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Deals() {
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const { dealsData, allDeals } = useDealData();
  
  return (
    <div className="space-y-6">
      <DealsHeader 
        onAddDeal={() => setIsAddingDeal(true)} 
      />
      
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <DealsFilters />
        
        <Tabs defaultValue="kanban" className="w-[200px]" onValueChange={(v) => setViewMode(v as 'kanban' | 'list')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {viewMode === 'kanban' ? (
        <KanbanView 
          dealsData={dealsData}
          onDealClick={(dealId) => setSelectedDeal(dealId)}
        />
      ) : (
        <ListView 
          allDeals={allDeals}
          onDealClick={(dealId) => setSelectedDeal(dealId)}
        />
      )}
      
      {/* Dialog for adding new deal */}
      <Dialog open={isAddingDeal} onOpenChange={setIsAddingDeal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
          </DialogHeader>
          <DealForm onComplete={() => setIsAddingDeal(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Dialog for viewing deal details */}
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
