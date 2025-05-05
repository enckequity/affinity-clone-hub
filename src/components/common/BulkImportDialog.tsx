
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'contacts' | 'companies' | 'deals' | 'activities';
}

export function BulkImportDialog({ 
  open, 
  onOpenChange,
  entityType 
}: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mappingType, setMappingType] = useState<string>('auto');
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would normally process the file
    toast({
      title: "Import started",
      description: `${file.name} is being processed. You'll be notified when it's complete.`
    });
    
    // Simulate processing delay
    setTimeout(() => {
      toast({
        title: "Import complete",
        description: `Successfully imported ${entityType} from ${file.name}.`
      });
      onOpenChange(false);
      setFile(null);
    }, 2000);
  };
  
  const getEntityName = () => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase();
  };
  
  const handleDownloadSample = () => {
    // This would normally generate and download a sample CSV file
    toast({
      title: "Sample downloaded",
      description: `Sample ${entityType} CSV template has been downloaded.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import {getEntityName()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure your CSV file has the required columns. Download a sample file for reference.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted/40 rounded-md p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">Download a sample CSV file</p>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleDownloadSample}
            >
              <Download className="h-4 w-4 mr-1" />
              Download Sample
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload CSV File</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/40 transition-colors">
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV files only (max 10MB)
                  </p>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mapping">Column Mapping</Label>
              <Select value={mappingType} onValueChange={setMappingType}>
                <SelectTrigger id="mapping">
                  <SelectValue placeholder="Select mapping type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect columns</SelectItem>
                  <SelectItem value="manual">Manual mapping</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Auto-detect will try to match your CSV columns to our fields automatically
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file}>
              Import {getEntityName()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
