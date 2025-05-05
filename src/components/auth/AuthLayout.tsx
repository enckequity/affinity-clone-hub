
import React from 'react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Affinity CRM</h1>
        </div>
        <div className="bg-white rounded-lg shadow-lg border border-border p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
