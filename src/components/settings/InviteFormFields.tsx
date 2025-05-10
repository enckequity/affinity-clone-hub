
import React from 'react';
import { Control } from "react-hook-form";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InviteFormValues } from '@/types/invitationTypes';

interface InviteFormFieldsProps {
  control: Control<InviteFormValues>;
  isSubmitting: boolean;
}

export function InviteFormFields({ control, isSubmitting }: InviteFormFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input 
                placeholder="colleague@example.com" 
                type="email"
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Team Member</SelectItem>
                  <SelectItem value="readonly">Read-only</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <p className="text-xs text-muted-foreground mt-1">
              {field.value === 'admin' && 'Full access to all features and settings'}
              {field.value === 'manager' && 'Can manage deals, contacts, and activities, but limited settings access'}
              {field.value === 'member' && 'Can create and update deals, contacts, and activities'}
              {field.value === 'readonly' && 'Can only view information, no editing capabilities'}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Personal Message (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add a personal message to your invitation..." 
                className="min-h-[100px]"
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
