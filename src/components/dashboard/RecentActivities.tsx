
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Mail,
  Phone,
  PenLine,
  Handshake
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'note',
    title: 'Added a note to Acme Inc.',
    description: 'Meeting notes from quarterly review',
    date: '2 hours ago',
    icon: FileText,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100'
  },
  {
    id: 2,
    type: 'email',
    title: 'Sent email to Sarah Johnson',
    description: 'Follow-up about the proposal',
    date: '4 hours ago',
    icon: Mail,
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-100'
  },
  {
    id: 3,
    type: 'meeting',
    title: 'Meeting with XYZ Corp',
    description: 'Product demo and Q&A session',
    date: 'Yesterday',
    icon: Calendar,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100'
  },
  {
    id: 4,
    type: 'call',
    title: 'Call with John Smith',
    description: 'Discussed partnership opportunities',
    date: 'Yesterday',
    icon: Phone,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100'
  },
  {
    id: 5,
    type: 'deal',
    title: 'Closed deal with TechStart Inc',
    description: '$48,500 - Annual subscription',
    date: '2 days ago',
    icon: Handshake,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100'
  }
];

export function RecentActivities() {
  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <div className="flex items-start gap-3">
            <div className={`h-8 w-8 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0`}>
              <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
            </div>
          </div>
          {index < activities.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  );
}
