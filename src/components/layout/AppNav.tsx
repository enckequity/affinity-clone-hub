
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  TrendingUp, 
  CalendarClock,
  Workflow,
  Settings,
  HelpCircle
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: Users,
  },
  {
    title: 'Companies',
    href: '/companies',
    icon: Building2,
  },
  {
    title: 'Deals',
    href: '/deals',
    icon: TrendingUp,
  },
  {
    title: 'Activities',
    href: '/activities',
    icon: CalendarClock,
  },
  {
    title: 'Workflows',
    href: '/workflows',
    icon: Workflow,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Help',
    href: '/help',
    icon: HelpCircle,
  }
];

interface AppNavProps {
  isCollapsed: boolean;
}

export function AppNav({ isCollapsed }: AppNavProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <nav className="grid gap-1 px-2">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            currentPath === item.href ? 
              "bg-muted font-medium text-primary" : 
              "hover:bg-muted hover:text-primary"
          )}
        >
          <item.icon className="h-4 w-4" />
          {!isCollapsed && <span>{item.title}</span>}
        </Link>
      ))}
    </nav>
  );
}
