
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AlertCircle, Download, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

type BulkImportSheetProps = {
  entityType: 'contacts' | 'companies' | 'deals';
  triggerButton?: React.ReactNode;
  onImportComplete?: () => void;
};

const sampleData = {
  contacts: `First Name,Last Name,Email,Phone,Company,Job Title,Status
John,Doe,john.doe@example.com,(555) 123-4567,Acme Inc,Sales Manager,Lead
Jane,Smith,jane.smith@example.com,(555) 987-6543,Tech Innovate,CEO,Customer`,
  
  companies: `Company Name,Industry,Website,Size,Location,Revenue,Status
Acme Inc,Technology,acmeinc.com,50-100,San Francisco CA,2500000,Customer
Tech Innovate,Software,techinnovate.co,10-50,Austin TX,1200000,Prospect`,
  
  deals: `Deal Name,Company,Value,Stage,Expected Close Date,Owner,Probability
Enterprise Software License,Acme Inc,35000,Proposal,2025-07-15,John Smith,60
Cloud Migration Services,Tech Innovate,85000,Negotiation,2025-06-30,Jane Doe,80`
};

export function BulkImportSheet({ entityType, triggerButton, onImportComplete }: BulkImportSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleDownloadSample = () => {
    const blob = new Blob([sampleData[entityType]], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${entityType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real application, you would upload and process the file here
    
    setIsSubmitting(false);
    setFile(null);
    setIsOpen(false);
    
    toast({
      title: `${entityLabel} imported successfully`,
      description: `Your ${entityType} have been imported and are now available in the system.`
    });
    
    if (onImportComplete) {
      onImportComplete();
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import {entityLabel}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Bulk Import {entityLabel}</SheetTitle>
          <SheetDescription>
            Upload a CSV file to import multiple {entityType} at once.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure your CSV file follows the correct format. You can download a sample file below.
            </AlertDescription>
          </Alert>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDownloadSample}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Sample CSV
            </Button>
            
            <div className="space-y-2">
              <label htmlFor="csv-file" className="text-sm font-medium">
                Select CSV File
              </label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-6">
            <Button 
              type="submit" 
              disabled={!file || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>Processing</>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import {entityLabel}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
