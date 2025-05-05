
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase,
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppNav() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="py-5 px-3">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-sidebar-foreground">
            Affinity CRM
          </h1>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-3">
        <div className="space-y-1">
          <NavLink to="/" className={({isActive}) => 
            `crm-sidebar-link ${isActive ? 'active' : ''}`
          }>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/contacts" className={({isActive}) => 
            `crm-sidebar-link ${isActive ? 'active' : ''}`
          }>
            <Users className="w-5 h-5" />
            <span>Contacts</span>
          </NavLink>
          
          <NavLink to="/companies" className={({isActive}) => 
            `crm-sidebar-link ${isActive ? 'active' : ''}`
          }>
            <Building2 className="w-5 h-5" />
            <span>Companies</span>
          </NavLink>
          
          <NavLink to="/deals" className={({isActive}) => 
            `crm-sidebar-link ${isActive ? 'active' : ''}`
          }>
            <Briefcase className="w-5 h-5" />
            <span>Deals</span>
          </NavLink>
          
          <NavLink to="/activities" className={({isActive}) => 
            `crm-sidebar-link ${isActive ? 'active' : ''}`
          }>
            <MessageSquare className="w-5 h-5" />
            <span>Activities</span>
          </NavLink>
        </div>
        
        <Separator className="my-4 bg-sidebar-border" />
        
        <div className="space-y-1">
          <NavLink to="/settings" className={({isActive}) => 
            `crm-sidebar-link ${isActive ? 'active' : ''}`
          }>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </div>
      </SidebarContent>
      
      <SidebarFooter className="p-3 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span>Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
