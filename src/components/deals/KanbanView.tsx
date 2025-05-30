
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { DealCard } from '@/components/deals/DealCard';
import { DealsDataByStage, Deal } from '@/hooks/use-deal-data';

interface KanbanViewProps {
  dealsData: DealsDataByStage;
  onDealClick: (id: number) => void;
}

export function KanbanView({ dealsData, onDealClick }: KanbanViewProps) {
  // Define stage colors with iOS palette
  const stageConfigs = {
    lead: { color: 'bg-crm-orange', label: 'Lead' },
    qualified: { color: 'bg-crm-yellow', label: 'Qualified' },
    proposal: { color: 'bg-crm-blue', label: 'Proposal' },
    negotiation: { color: 'bg-crm-indigo', label: 'Negotiation' },
    'closed-won': { color: 'bg-crm-green', label: 'Closed Won' },
    'closed-lost': { color: 'bg-crm-red', label: 'Closed Lost' }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
      {Object.entries(dealsData).map(([stage, deals]) => (
        <div className="space-y-4 glass-morphism p-4 rounded-xl" key={stage}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stageConfigs[stage as keyof typeof stageConfigs].color}`}></div>
              <h3 className="font-medium text-sm">{stageConfigs[stage as keyof typeof stageConfigs].label}</h3>
            </div>
            <Badge variant="outline" className="rounded-full text-xs">{deals.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {deals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onClick={() => onDealClick(deal.id)} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
