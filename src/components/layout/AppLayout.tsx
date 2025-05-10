
import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Search, Menu, MessageSquare, Mic } from "lucide-react";
import { AppNav } from './AppNav';
import { UserMenu } from './UserMenu';
import { SearchInput } from './SearchInput';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NaturalLanguageSearch } from '../ai/NaturalLanguageSearch';
import { VoiceNotesDialog } from '../activities/VoiceNotesDialog';

export function AppLayout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user } = useAuth();
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [isVoiceNotesOpen, setIsVoiceNotesOpen] = useState(false);
  
  // Handle responsive sidebar state
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <div className={cn(
          "transition-all duration-300 bg-sidebar flex-shrink-0 border-r border-sidebar-border",
          sidebarOpen ? "w-[220px]" : "w-[70px]"
        )}>
          <AppNav isSidebarCollapsed={!sidebarOpen} />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card/50 backdrop-blur-sm border-b border-border h-16 flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="flex md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SearchInput />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-full"
                onClick={() => setIsVoiceNotesOpen(true)}
              >
                <Mic className="h-4 w-4" />
                <span className="hidden md:inline">Voice Notes</span>
              </Button>
              
              <Dialog open={isAISearchOpen} onOpenChange={setIsAISearchOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden md:inline">Ask AI Assistant</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] glass-morphism">
                  <DialogHeader>
                    <DialogTitle>AI Assistant</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <NaturalLanguageSearch />
                  </div>
                </DialogContent>
              </Dialog>
              <UserMenu />
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      
      <VoiceNotesDialog 
        open={isVoiceNotesOpen} 
        onOpenChange={setIsVoiceNotesOpen}
      />
    </SidebarProvider>
  );
}

import { cn } from "@/lib/utils";
