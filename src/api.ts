// api.js

import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const saveSettings = async (settings) => {
  const response = await api.post('/settings', settings);
  return response.data;
}

export default api;