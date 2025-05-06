
import React from 'react';
import { Loader2 } from "lucide-react";

export function SavingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-center">Saving notes to customer records...</p>
    </div>
  );
}
