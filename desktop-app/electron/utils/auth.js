
const axios = require('axios');

/**
 * Set up authentication handlers for the desktop application
 * 
 * @param {Object} ipcMain - Electron IPC main instance
 * @param {Object} store - Electron store for settings
 * @param {Object} keytar - System keychain access module
 * @param {String} serviceName - Service name for keychain
 * @param {String} accountName - Account name for keychain
 * @param {Object} apiClient - API client instance
 * @param {String} appId - Unique ID for this app installation
 */
function setupAuthHandlers(ipcMain, store, keytar, serviceName, accountName, apiClient, appId) {
  // Get authentication status
  ipcMain.handle('auth:status', async () => {
    try {
      // Check if we have a token
      const token = await keytar.getPassword(serviceName, accountName);
      if (!token) return { authenticated: false };
      
      // Verify token with Supabase
      const response = await axios.get('https://nvxeceukxkyqnqztnkep.supabase.co/auth/v1/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': token
        }
      });
      
      return { 
        authenticated: true, 
        user: response.data
      };
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Token might be invalid, delete it
      await keytar.deletePassword(serviceName, accountName);
      return { authenticated: false, error: 'Session expired' };
    }
  });

  // Login handler
  ipcMain.handle('auth:login', async (event, { email, password }) => {
    try {
      // Login to Supabase
      const response = await axios.post(
        'https://nvxeceukxkyqnqztnkep.supabase.co/auth/v1/token?grant_type=password',
        { email, password },
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eGVjZXVreGt5cW5xenRua2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzA1NTksImV4cCI6MjA2MjA0NjU1OX0.J825UwwJsWIzwGae1XCjtd6_yNmWoB-4JPXVS61MMpY',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { access_token, user } = response.data;
      
      // Store token securely
      await keytar.setPassword(serviceName, accountName, access_token);
      
      // Update API client with new token
      apiClient.setAuthToken(access_token);
      
      // Register this desktop app instance with backend
      const registrationResult = await apiClient.registerApp({
        auth_token: access_token,
        app_id: appId
      });
      
      if (!registrationResult.success) {
        throw new Error(registrationResult.error || 'Failed to register app');
      }
      
      // Store user ID for sync operations
      store.set('userId', user.id);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error_description || error.message 
      };
    }
  });

  // Logout handler
  ipcMain.handle('auth:logout', async () => {
    try {
      const token = await keytar.getPassword(serviceName, accountName);
      
      if (token) {
        // Call Supabase logout
        await axios.post(
          'https://nvxeceukxkyqnqztnkep.supabase.co/auth/v1/logout',
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eGVjZXVreGt5cW5xenRua2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzA1NTksImV4cCI6MjA2MjA0NjU1OX0.J825UwwJsWIzwGae1XCjtd6_yNmWoB-4JPXVS61MMpY'
            }
          }
        );
        
        // Clear stored token
        await keytar.deletePassword(serviceName, accountName);
      }
      
      // Update API client
      apiClient.setAuthToken(null);
      
      // Clear user ID
      store.delete('userId');
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      // Still delete the token on failure
      await keytar.deletePassword(serviceName, accountName);
      return { success: true }; // Return success anyway to clear local state
    }
  });
}

module.exports = { setupAuthHandlers };
