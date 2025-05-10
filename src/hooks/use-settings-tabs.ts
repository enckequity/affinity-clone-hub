
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SettingsTab = 
  'profile' | 
  'account' | 
  'team' | 
  'communications' | 
  'billing' | 
  'notifications' | 
  'integrations';

export function useSettingsTabs() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize from URL params
  useEffect(() => {
    const tab = searchParams.get('tab') as SettingsTab | null;
    if (tab && isValidTab(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const newTab = value as SettingsTab;
    if (isValidTab(newTab)) {
      setActiveTab(newTab);
      searchParams.set('tab', newTab);
      setSearchParams(searchParams);
    }
  };
  
  // Helper function to validate tabs
  function isValidTab(tab: string): tab is SettingsTab {
    return [
      'profile', 
      'account', 
      'team', 
      'communications', 
      'billing', 
      'notifications', 
      'integrations'
    ].includes(tab);
  }
  
  return { 
    activeTab, 
    handleTabChange 
  };
}
