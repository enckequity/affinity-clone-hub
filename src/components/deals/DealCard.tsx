
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Building2, Calendar, DollarSign, User } from 'lucide-react';

interface DealCardProps {
  deal: any;
  onClick: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  return (
    <div 
      className="bg-white p-3 rounded-md border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div>
          <h3 className="font-medium truncate">{deal.name}</h3>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Building2 className="w-3 h-3 mr-1" />
            {deal.company}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <DollarSign className="w-3 h-3 mr-1 text-muted-foreground" />
              <span>${deal.value.toLocaleString()}</span>
            </div>
            <div className="text-xs font-medium">
              {deal.probability}%
            </div>
          </div>
          
          <div className="flex items-center text-xs">
            <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
            <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">{deal.ownerAvatar}</AvatarFallback>
            </Avatar>
            <span className="text-xs ml-1.5">{deal.owner}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {deal.lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );
}
