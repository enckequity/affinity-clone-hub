
import { useCommunicationsList } from './communications/use-communications-list';
import { useSyncLogs } from './communications/use-sync-logs';
import { useContactMappings } from './communications/use-contact-mappings';
import { useUserSettings } from './communications/use-user-settings';

export function useCommunications() {
  const communictionsList = useCommunicationsList();
  const syncLogsData = useSyncLogs();
  const contactMappingsData = useContactMappings();
  const userSettingsData = useUserSettings();
  
  return {
    // Communications data and functions
    communications: communictionsList.communications,
    isLoadingCommunications: communictionsList.isLoadingCommunications,
    isErrorCommunications: communictionsList.isErrorCommunications,
    errorCommunications: communictionsList.errorCommunications,
    searchQuery: communictionsList.searchQuery,
    setSearchQuery: communictionsList.setSearchQuery,
    filterByType: communictionsList.filterByType,
    setFilterByType: communictionsList.setFilterByType,
    filterByImportance: communictionsList.filterByImportance,
    setFilterByImportance: communictionsList.setFilterByImportance,
    markAsRead: communictionsList.markAsRead,
    toggleImportance: communictionsList.toggleImportance,
    
    // Sync logs data and functions
    syncLogs: syncLogsData.syncLogs,
    isLoadingSyncLogs: syncLogsData.isLoadingSyncLogs,
    isErrorSyncLogs: syncLogsData.isErrorSyncLogs,
    errorSyncLogs: syncLogsData.errorSyncLogs,
    initiateManualSync: syncLogsData.initiateManualSync,
    
    // Contact mappings data and functions
    contactMappings: contactMappingsData.contactMappings,
    isLoadingContactMappings: contactMappingsData.isLoadingContactMappings,
    isErrorContactMappings: contactMappingsData.isErrorContactMappings,
    errorContactMappings: contactMappingsData.errorContactMappings,
    updateContactMapping: contactMappingsData.updateContactMapping,
    
    // User settings data and functions
    userSettings: userSettingsData.userSettings,
    isLoadingUserSettings: userSettingsData.isLoadingUserSettings,
    updateUserSettings: userSettingsData.updateUserSettings
  };
}
