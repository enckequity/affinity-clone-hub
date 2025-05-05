
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Deal } from '@/hooks/use-deal-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ListViewProps {
  allDeals: Deal[];
  onDealClick: (id: number) => void;
}

export function ListView({ allDeals, onDealClick }: ListViewProps) {
  // Define badge colors based on stage
  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-orange-500';
      case 'qualified': return 'bg-yellow-500';
      case 'proposal': return 'bg-blue-500';
      case 'negotiation': return 'bg-purple-500';
      case 'closed-won': return 'bg-green-500';
      case 'closed-lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="bg-white rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Expected Close</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allDeals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell>
                <div className="font-medium">{deal.name}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{deal.companyAvatar}</AvatarFallback>
                  </Avatar>
                  <span>{deal.company}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStageBadgeColor(deal.stage)}>
                  {deal.stageLabel}
                </Badge>
              </TableCell>
              <TableCell>${deal.value.toLocaleString()}</TableCell>
              <TableCell>{new Date(deal.expectedCloseDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{deal.ownerAvatar}</AvatarFallback>
                  </Avatar>
                  <span>{deal.owner}</span>
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => onDealClick(deal.id)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
