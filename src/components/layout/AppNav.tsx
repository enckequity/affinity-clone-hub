
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
    <nav className="space-y-2 px-2 py-5 mt-2">
      {navItems.map((item) => (
        <NavLink to={item.href} key={item.href}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              size={isSidebarCollapsed ? "icon" : "default"}
              className={cn(
                "w-fit min-w-[40px] justify-start",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:text-foreground",
                isSidebarCollapsed && "justify-center px-2",
                !isSidebarCollapsed && !isMobile && "pr-2"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", !isSidebarCollapsed && "mr-2")}
              />
              {!isSidebarCollapsed && !isMobile && <span className="whitespace-nowrap">{item.title}</span>}
            </Button>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
