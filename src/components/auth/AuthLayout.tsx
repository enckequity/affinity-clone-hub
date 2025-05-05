
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';

export function AuthLayout() {
  useAuthRedirect();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Affinity CRM</h1>
            <p className="text-muted-foreground text-sm mt-1">Intelligent relationship management</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg border border-border p-8">
          <Outlet />
        </div>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Powered by AI and modern workflows</p>
        </div>
      </div>
    </div>
  );
}
