
import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users,
  Building2,
  MessagesSquare,
  Calendar,
  Settings,
  HelpCircle,
  DollarSign,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppNavProps {
  isSidebarCollapsed: boolean;
}

export const AppNav = ({ isSidebarCollapsed }: AppNavProps) => {
  const isMobile = useIsMobile();
  
  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: BarChart3,
    },
    {
      title: "Contacts",
      href: "/contacts",
      icon: Users,
    },
    {
      title: "Companies",
      href: "/companies",
      icon: Building2,
    },
    {
      title: "Communications",
      href: "/communications",
      icon: MessagesSquare,
    },
    {
      title: "Deals",
      href: "/deals",
      icon: DollarSign,
    },
    {
      title: "Activities",
      href: "/activities",
      icon: Calendar,
    },
    {
      title: "Workflows",
      href: "/workflows",
      icon: GitBranch,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "Help",
      href: "/help",
      icon: HelpCircle,
    },
  ];
  
  return (
    <nav className="py-5 mt-2">
      <div className="flex flex-col items-start gap-1">
        {navItems.map((item) => (
          <NavLink to={item.href} key={item.href} className="w-full px-3">
            {({ isActive }) => (
              <Button
                variant="ghost"
                size={isSidebarCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full h-10 subtle-transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  isSidebarCollapsed 
                    ? "p-0 flex justify-center items-center" 
                    : "justify-start px-3",
                  "rounded-lg"  
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && !isMobile && (
                  <span className="ml-2 truncate text-sm font-medium">{item.title}</span>
                )}
              </Button>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
