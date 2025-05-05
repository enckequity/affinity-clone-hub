
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { DealCard } from '@/components/deals/DealCard';
import { DealsDataByStage, Deal } from '@/hooks/use-deal-data';

interface KanbanViewProps {
  dealsData: DealsDataByStage;
  onDealClick: (id: number) => void;
}

export function KanbanView({ dealsData, onDealClick }: KanbanViewProps) {
  // Define stage colors and labels
  const stageConfigs = {
    lead: { color: 'bg-orange-500', label: 'Lead' },
    qualified: { color: 'bg-yellow-500', label: 'Qualified' },
    proposal: { color: 'bg-blue-500', label: 'Proposal' },
    negotiation: { color: 'bg-purple-500', label: 'Negotiation' },
    'closed-won': { color: 'bg-green-500', label: 'Closed Won' },
    'closed-lost': { color: 'bg-red-500', label: 'Closed Lost' }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
      {Object.entries(dealsData).map(([stage, deals]) => (
        <div className="space-y-4" key={stage}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stageConfigs[stage as keyof typeof stageConfigs].color}`}></div>
              <h3 className="font-medium">{stageConfigs[stage as keyof typeof stageConfigs].label}</h3>
            </div>
            <Badge variant="outline">{deals.length}</Badge>
          </div>
          
          {deals.map((deal) => (
            <DealCard 
              key={deal.id} 
              deal={deal} 
              onClick={() => onDealClick(deal.id)} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}
