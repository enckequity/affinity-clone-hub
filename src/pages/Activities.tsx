
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Mail, 
  Phone, 
  FileText,
  Building2,
  User,
  Plus,
  CheckCircle,
  Clock,
  Filter,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ActivityForm } from '@/components/activities/ActivityForm';

// Sample data for the activities feed
const activitiesData = [
  {
    id: 1,
    type: 'email',
    title: 'Email to Sarah Johnson',
    description: 'Sent proposal follow-up',
    date: '2023-08-15T14:30:00',
    relatedTo: 'Tech Innovate',
    relatedToType: 'company',
    contact: 'Sarah Johnson',
    user: 'John Doe',
    userAvatar: 'JD',
    icon: Mail,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    completed: true
  },
  {
    id: 2,
    type: 'call',
    title: 'Call with Mike Brown',
    description: 'Discussed implementation timeline',
    date: '2023-08-15T11:00:00',
    relatedTo: 'Global Finance',
    relatedToType: 'company',
    contact: 'Mike Brown',
    user: 'Sarah Adams',
    userAvatar: 'SA',
    icon: Phone,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100',
    completed: true
  },
  {
    id: 3,
    type: 'meeting',
    title: 'Meeting with Acme Inc',
    description: 'Product demo for new features',
    date: '2023-08-16T15:00:00',
    relatedTo: 'Acme Inc',
    relatedToType: 'company',
    contact: 'John Smith',
    user: 'John Doe',
    userAvatar: 'JD',
    icon: CalendarIcon,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100',
    completed: false
  },
  {
    id: 4,
    type: 'note',
    title: 'Note about XYZ Tech',
    description: 'They need more information about security features',
    date: '2023-08-14T09:15:00',
    relatedTo: 'XYZ Tech',
    relatedToType: 'company',
    contact: 'Emily Davis',
    user: 'Sarah Adams',
    userAvatar: 'SA',
    icon: FileText,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-100',
    completed: true
  },
  {
    id: 5,
    type: 'email',
    title: 'Email to David Rodriguez',
    description: 'Sent pricing information',
    date: '2023-08-17T10:30:00',
    relatedTo: 'New Startup',
    relatedToType: 'company',
    contact: 'David Rodriguez',
    user: 'John Doe',
    userAvatar: 'JD',
    icon: Mail,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    completed: false
  }
];

// Sort activities by date
const sortedActivities = [...activitiesData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Group activities by date
const today = new Date();
today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

const groupedActivities = {
  overdue: sortedActivities.filter(a => new Date(a.date) < today && !a.completed),
  today: sortedActivities.filter(a => {
    const activityDate = new Date(a.date);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime();
  }),
  tomorrow: sortedActivities.filter(a => {
    const activityDate = new Date(a.date);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === tomorrow.getTime();
  }),
  upcoming: sortedActivities.filter(a => new Date(a.date) >= dayAfterTomorrow),
  completed: sortedActivities.filter(a => a.completed)
};

export default function Activities() {
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">Track your interactions and follow-ups.</p>
        </div>
        
        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log New Activity</DialogTitle>
            </DialogHeader>
            <ActivityForm onComplete={() => setIsAddingActivity(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search activities..." 
                className="pl-9 w-full" 
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="call">Calls</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4 mt-4">
              {groupedActivities.overdue.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                  {groupedActivities.overdue.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
              
              {groupedActivities.today.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Today</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(today, 'EEEE, MMMM do')}
                    </span>
                  </div>
                  {groupedActivities.today.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
              
              {groupedActivities.tomorrow.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Tomorrow</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(tomorrow, 'EEEE, MMMM do')}
                    </span>
                  </div>
                  {groupedActivities.tomorrow.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
              
              {groupedActivities.upcoming.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  {groupedActivities.upcoming.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4 mt-4">
              {groupedActivities.completed.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Activity Calendar</CardTitle>
              <CardDescription>
                View and schedule your activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {selectedDate && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      Activities on {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    
                    <div className="space-y-2">
                      {activitiesData
                        .filter(activity => {
                          const activityDate = new Date(activity.date);
                          return (
                            activityDate.getDate() === selectedDate.getDate() &&
                            activityDate.getMonth() === selectedDate.getMonth() &&
                            activityDate.getFullYear() === selectedDate.getFullYear()
                          );
                        })
                        .map((activity) => (
                          <div 
                            key={activity.id} 
                            className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50"
                          >
                            <div className={`h-8 w-8 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0`}>
                              <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(activity.date), 'h:mm a')} • {activity.contact}
                              </p>
                            </div>
                          </div>
                        ))
                      }
                      
                      {activitiesData.filter(activity => {
                        const activityDate = new Date(activity.date);
                        return (
                          activityDate.getDate() === selectedDate.getDate() &&
                          activityDate.getMonth() === selectedDate.getMonth() &&
                          activityDate.getFullYear() === selectedDate.getFullYear()
                        );
                      }).length === 0 && (
                        <p className="text-sm text-muted-foreground py-2">
                          No activities scheduled for this day.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Activity Summary</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-semibold">{activitiesData.filter(a => !a.completed).length}</p>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-semibold">{activitiesData.filter(a => a.completed).length}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-semibold">{activitiesData.filter(a => a.type === 'call' || a.type === 'meeting').length}</p>
                      <p className="text-xs text-muted-foreground">Calls & Meetings</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-semibold">{activitiesData.filter(a => a.type === 'email').length}</p>
                      <p className="text-xs text-muted-foreground">Emails</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ActivityCardProps {
  activity: any;
}

function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0`}>
            <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              
              {activity.completed ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Done
                </Badge>
              ) : (
                <Badge variant={new Date(activity.date) < today ? "destructive" : "outline"} className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {format(new Date(activity.date), 'h:mm a')}
                </Badge>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {activity.relatedToType === 'company' ? (
                    <Building2 className="h-3 w-3 mr-1 text-muted-foreground" />
                  ) : (
                    <User className="h-3 w-3 mr-1 text-muted-foreground" />
                  )}
                  <span>{activity.relatedTo}</span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span>{activity.contact}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">{activity.userAvatar}</AvatarFallback>
                </Avatar>
                <span className="text-xs ml-1.5">{activity.user}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
