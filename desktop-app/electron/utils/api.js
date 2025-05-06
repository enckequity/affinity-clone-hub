
const axios = require('axios');

/**
 * Create and configure API client for communicating with backend services
 * @param {string} token - Authentication token
 * @returns {Object} API client methods
 */
function setupApiClient(token) {
  // Base configuration for API client
  const baseURL = "https://nvxeceukxkyqnqztnkep.supabase.co";
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  // Create axios instance
  const axiosInstance = axios.create({
    baseURL,
    headers: defaultHeaders,
    timeout: 30000 // 30 seconds
  });

  // Set auth token if available
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Request interceptor for handling errors
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      console.error('API request failed:', error);
      return Promise.reject(error);
    }
  );

  // API methods
  return {
    /**
     * Set authentication token for future requests
     * @param {string} newToken - Authentication token
     */
    setAuthToken(newToken) {
      if (newToken) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
      }
    },

    /**
     * Register desktop app with backend
     * @param {Object} params - Registration parameters
     * @returns {Promise} - Registration result
     */
    async registerApp(params) {
      try {
        const response = await axiosInstance.post('/functions/v1/desktop-auth', params);
        return response.data;
      } catch (error) {
        console.error('App registration failed:', error);
        return { 
          success: false, 
          error: error.response?.data?.error || error.message 
        };
      }
    },

    /**
     * Trigger sync operation
     * @returns {Promise} - Sync operation result
     */
    async triggerSync() {
      try {
        const response = await axiosInstance.post('/functions/v1/process-imazing-sync', {
          communications: [],
          sync_type: 'manual',
          user_id: 'current', // Will be replaced with actual user ID in sync module
        });
        return { success: true, ...response.data };
      } catch (error) {
        console.error('Sync trigger failed:', error);
        return { 
          success: false, 
          error: error.response?.data?.error || error.message 
        };
      }
    },

    /**
     * Send batch of communications to backend
     * @param {Array} communications - Communications data 
     * @param {Object} metadata - Additional metadata
     * @returns {Promise} - Send result
     */
    async sendCommunicationsBatch(communications, metadata) {
      try {
        const response = await axiosInstance.post('/functions/v1/process-imazing-sync', {
          communications,
          ...metadata
        });
        return { success: true, ...response.data };
      } catch (error) {
        console.error('Sending communications batch failed:', error);
        return { 
          success: false, 
          error: error.response?.data?.error || error.message 
        };
      }
    }
  };
}

module.exports = { setupApiClient };
