
import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Search, User, ChevronRight, ChevronLeft, Menu } from "lucide-react";
import { AppNav } from './AppNav';
import { UserMenu } from './UserMenu';
import { SearchInput } from './SearchInput';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full">
        <AppNav />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-border h-16 flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SearchInput />
            </div>
            
            <UserMenu />
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
