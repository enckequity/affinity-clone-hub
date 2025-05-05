
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useContacts } from '@/hooks/use-contacts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Combobox } from '@/components/ui/combobox';

interface ContactFormProps {
  onComplete: () => void;
  existingContact?: any;
}

export function ContactForm({ onComplete, existingContact }: ContactFormProps) {
  const { toast } = useToast();
  const { createContact, updateContact } = useContacts();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_id: null as string | null,
    job_title: '',
    notes: '',
    tags: '',
  });
  
  // Load existing contact data if provided
  useEffect(() => {
    if (existingContact) {
      setFormData({
        first_name: existingContact.firstName || '',
        last_name: existingContact.lastName || '',
        email: existingContact.email || '',
        phone: existingContact.phone || '',
        company_id: existingContact.company_id || null,
        job_title: existingContact.title || '',
        notes: existingContact.notes || '',
        tags: existingContact.tags?.join(', ') || '',
      });
      
      if (existingContact.company_id) {
        setSelectedCompany(existingContact.company_id);
      }
    }
  }, [existingContact]);
  
  // Fetch companies for the dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
        
      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }
      
      setCompanies(data || []);
    };
    
    fetchCompanies();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setFormData(prev => ({ ...prev, company_id: companyId }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save contacts',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Process tags if any
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];
      
      const contactData = {
        ...formData,
        created_by: user.id,
        // Don't include tags in the contact object as they need separate handling
        tags: undefined,
      };
      
      if (existingContact?.id) {
        await updateContact.mutateAsync({
          id: existingContact.id,
          ...contactData,
        });
      } else {
        await createContact.mutateAsync(contactData);
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };
  
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name,
  }));
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input 
            id="first_name" 
            name="first_name" 
            placeholder="John"
            value={formData.first_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input 
            id="last_name" 
            name="last_name" 
            placeholder="Smith"
            value={formData.last_name}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="john.smith@example.com"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input 
          id="phone" 
          name="phone" 
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Combobox
          items={companyOptions}
          value={selectedCompany}
          onChange={handleCompanyChange}
          placeholder="Select a company"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="job_title">Job Title</Label>
        <Input 
          id="job_title" 
          name="job_title" 
          placeholder="CEO"
          value={formData.job_title}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input 
          id="tags"
          name="tags" 
          placeholder="Customer, Decision Maker"
          value={formData.tags}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          placeholder="Add any relevant notes about this contact..."
          value={formData.notes}
          onChange={handleInputChange}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit">
          {existingContact ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
}
