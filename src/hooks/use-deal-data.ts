
import { useState, useEffect } from 'react';

// Sample data for the deals
const dealsData = {
  lead: [
    {
      id: 1,
      name: 'Software Upgrade',
      company: 'Acme Inc',
      value: 15000,
      stage: 'lead',
      stageLabel: 'Lead',
      expectedCloseDate: '2023-10-15',
      owner: 'John Doe',
      ownerAvatar: 'JD',
      companyAvatar: 'AI',
      probability: 20,
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      name: 'Data Consulting',
      company: 'Tech Innovate',
      value: 8500,
      stage: 'lead',
      stageLabel: 'Lead',
      expectedCloseDate: '2023-09-30',
      owner: 'Sarah Johnson',
      ownerAvatar: 'SJ',
      companyAvatar: 'TI',
      probability: 15,
      lastUpdated: '1 week ago'
    }
  ],
  qualified: [
    {
      id: 3,
      name: 'Marketing Campaign',
      company: 'Global Finance',
      value: 25000,
      stage: 'qualified',
      stageLabel: 'Qualified',
      expectedCloseDate: '2023-11-10',
      owner: 'John Doe',
      ownerAvatar: 'JD',
      companyAvatar: 'GF',
      probability: 35,
      lastUpdated: 'Yesterday'
    },
    {
      id: 4,
      name: 'Security Audit',
      company: 'New Startup',
      value: 12000,
      stage: 'qualified',
      stageLabel: 'Qualified',
      expectedCloseDate: '2023-10-05',
      owner: 'Mike Williams',
      ownerAvatar: 'MW',
      companyAvatar: 'NS',
      probability: 40,
      lastUpdated: '3 days ago'
    }
  ],
  proposal: [
    {
      id: 5,
      name: 'Enterprise License',
      company: 'Acme Inc',
      value: 48000,
      stage: 'proposal',
      stageLabel: 'Proposal',
      expectedCloseDate: '2023-09-15',
      owner: 'John Doe',
      ownerAvatar: 'JD',
      companyAvatar: 'AI',
      probability: 60,
      lastUpdated: '5 days ago'
    }
  ],
  negotiation: [
    {
      id: 6,
      name: 'Custom Development',
      company: 'XYZ Tech',
      value: 75000,
      stage: 'negotiation',
      stageLabel: 'Negotiation',
      expectedCloseDate: '2023-08-30',
      owner: 'Sarah Johnson',
      ownerAvatar: 'SJ',
      companyAvatar: 'XT',
      probability: 80,
      lastUpdated: 'Today'
    }
  ],
  'closed-won': [
    {
      id: 7,
      name: 'Staff Augmentation',
      company: 'Global Finance',
      value: 35000,
      stage: 'closed-won',
      stageLabel: 'Closed Won',
      expectedCloseDate: '2023-08-01',
      owner: 'Mike Williams',
      ownerAvatar: 'MW',
      companyAvatar: 'GF',
      probability: 100,
      lastUpdated: '2 weeks ago'
    }
  ],
  'closed-lost': [
    {
      id: 8,
      name: 'Hardware Upgrade',
      company: 'Tech Innovate',
      value: 18000,
      stage: 'closed-lost',
      stageLabel: 'Closed Lost',
      expectedCloseDate: '2023-07-15',
      owner: 'John Doe',
      ownerAvatar: 'JD',
      companyAvatar: 'TI',
      probability: 0,
      lastUpdated: '3 weeks ago'
    }
  ]
};

export type Deal = {
  id: number;
  name: string;
  company: string;
  value: number;
  stage: string;
  stageLabel: string;
  expectedCloseDate: string;
  owner: string;
  ownerAvatar: string;
  companyAvatar: string;
  probability: number;
  lastUpdated: string;
};

export type DealsDataByStage = {
  [key: string]: Deal[];
};

export function useDealData() {
  // Flatten deals for list view
  const allDeals = Object.values(dealsData).flat();
  
  return {
    dealsData,
    allDeals
  };
}
