import axios from 'axios';

import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000,
});

// Smart Retry and Wake-up Notification
api.interceptors.response.use(undefined, async (err) => {
  const { config, response } = err;
  if (!config || !config.retry) config.retry = 0;
  
  // Show a "Waking up" toast only once if it looks like a cold-start/slow server
  if (config.retry === 0 && (!response || response.status >= 500)) {
    toast.loading("Waking up the Stadium... Please wait.", { id: 'wake-up', duration: 4000 });
  }

  if (config.retry < 3 && (!response || response.status >= 500)) {
    config.retry += 1;
    await new Promise(res => setTimeout(res, 2000)); // wait 2s between retries
    return api(config);
  }
  
  if (err.config.retry >= 3) toast.dismiss('wake-up');
  return Promise.reject(err);
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
