
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { InviteTeamMember } from '@/components/settings/InviteTeamMember';

export function TeamSettings() {
  const [isInviting, setIsInviting] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your team and their permissions
            </CardDescription>
          </div>
          <Button onClick={() => setIsInviting(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">Sales Manager</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>john.doe@example.com</TableCell>
              <TableCell>
                <Badge>Admin</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Manage</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-xs text-muted-foreground">Sales Representative</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>jane.smith@example.com</TableCell>
              <TableCell>
                <Badge>Member</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Manage</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Robert Johnson</p>
                    <p className="text-xs text-muted-foreground">Marketing Director</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>robert.j@example.com</TableCell>
              <TableCell>
                <Badge>Manager</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Manage</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <InviteTeamMember open={isInviting} onOpenChange={setIsInviting} />
      </CardContent>
    </Card>
  );
}
