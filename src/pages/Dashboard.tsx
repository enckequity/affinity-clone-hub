
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Calendar, 
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Progress } from '@/components/ui/progress';
import { DealPipeline } from '@/components/dashboard/DealPipeline';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { profile } = useAuth();
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  const displayName = profile?.first_name 
    ? `${profile.first_name}` 
    : 'there';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{greeting()}, {displayName}</h1>
        <p className="text-muted-foreground">Here's an overview of your CRM activity and performance.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              +4 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              7 due this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$423,500</div>
            <p className="text-xs text-muted-foreground">
              +$105,000 from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Insights Component */}
      <div className="grid gap-4 grid-cols-1">
        <AIInsights />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>
              Current deal distribution by stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DealPipeline />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates from your CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivities />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Follow up with John Smith</span>
                </div>
                <span className="text-xs text-orange-500">Today</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Send proposal to Acme Inc</span>
                </div>
                <span className="text-xs text-red-500">Overdue</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Schedule meeting with XYZ Corp</span>
                </div>
                <span className="text-xs text-muted-foreground">Tomorrow</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Deal Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Lead to Qualified</span>
                  <span className="text-xs font-bold">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Qualified to Proposal</span>
                  <span className="text-xs font-bold">52%</span>
                </div>
                <Progress value={52} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Proposal to Closed</span>
                  <span className="text-xs font-bold">34%</span>
                </div>
                <Progress value={34} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Deal Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">4 deals closed this month</p>
                  <p className="text-xs text-muted-foreground">$142,500 in revenue</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">8 deals in negotiation</p>
                  <p className="text-xs text-muted-foreground">$275,000 potential revenue</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">11 deals in early stages</p>
                  <p className="text-xs text-muted-foreground">Qualifying opportunities</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
