import axios from 'axios';

const isDevelopment = import.meta.env.DEV;
const MAX_RETRIES = 3;

const api = axios.create({
  baseURL: isDevelopment ? '/api' : 'https://api.football-data.org',
  headers: {
    'X-Auth-Token': isDevelopment 
      ? undefined 
      : import.meta.env.VITE_API_KEY
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    
    // Initialize retry count for this request if it doesn't exist
    config.retryCount = config.retryCount || 0;

    if (error.response) {
      // Rate limit error
      if (error.response.status === 429 && config.retryCount < MAX_RETRIES) {
        config.retryCount++;

        const baseDelay = parseInt(error.response.headers['retry-after'] || '60');
        const delay = baseDelay * 1000;

        console.warn(`Rate limited. Retry attempt ${config.retryCount} of ${MAX_RETRIES} after ${baseDelay} seconds`);
        
        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return api(config);
      }
      
      // Handle other errors or if max retries reached
      const message = error.response.data?.message || error.response.data || error.message;
      throw new Error(message);
    }
    throw error;
  }
);

export default api; 