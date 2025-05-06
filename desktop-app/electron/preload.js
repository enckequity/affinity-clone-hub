
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Authentication
  login: (email, password) => ipcRenderer.invoke('auth:login', { email, password }),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getAuthStatus: () => ipcRenderer.invoke('auth:status'),
  
  // Sync operations
  startSync: () => ipcRenderer.invoke('sync:start'),
  getSyncStatus: () => ipcRenderer.invoke('sync:status'),
  getSyncHistory: () => ipcRenderer.invoke('sync:history'),
  
  // Settings management
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
  
  // iMazing integration
  checkImazingInstallation: () => ipcRenderer.invoke('imazing:check'),
  testImazingConnection: () => ipcRenderer.invoke('imazing:test'),
  
  // System
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  
  // Listen for events
  onSyncStatusChange: (callback) => {
    ipcRenderer.on('sync:status-change', (_, status) => callback(status));
    return () => ipcRenderer.removeAllListeners('sync:status-change');
  },
  onNotification: (callback) => {
    ipcRenderer.on('show-notification', (_, notification) => callback(notification));
    return () => ipcRenderer.removeAllListeners('show-notification');
  },
  onSetupWizard: (callback) => {
    ipcRenderer.on('show-setup-wizard', () => callback());
    return () => ipcRenderer.removeAllListeners('show-setup-wizard');
  }
});
