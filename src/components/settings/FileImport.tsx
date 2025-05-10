
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileUploadForm } from './FileUploadForm';
import { ImportResultDisplay } from './ImportResultDisplay';
import { useFileImport } from '@/hooks/use-file-import';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FileImport() {
  const { 
    state, 
    handleFileChange, 
    handleUpload, 
    resetForm, 
    toggleForceImport, 
    setProcessingMode 
  } = useFileImport();
  
  const [activeTab, setActiveTab] = useState<string>("standard");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setProcessingMode(value === "bulk" ? "bulk" : "standard");
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Import CSV</CardTitle>
          <CardDescription>
            Upload communication data from your CSV files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!state.result ? (
            <>
              <Tabs 
                defaultValue="standard" 
                value={activeTab} 
                onValueChange={handleTabChange}
                className="space-y-4"
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="standard">Standard Import</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk iMessage Import</TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use standard import for smaller CSV files with individual chat histories.
                  </p>
                </TabsContent>
                
                <TabsContent value="bulk" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use bulk import for large iMessage exports containing multiple conversations.
                    This mode processes the file in chunks and supports mapping conversation data.
                  </p>
                </TabsContent>
              </Tabs>
              
              <FileUploadForm 
                state={state}
                onFileChange={handleFileChange}
                onUpload={handleUpload}
                onReset={resetForm}
                onToggleForceImport={toggleForceImport}
              />
            </>
          ) : (
            <ImportResultDisplay
              result={state.result}
              onReset={resetForm}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
