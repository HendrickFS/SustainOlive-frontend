import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://193.136.195.37:8080/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const historicalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://193.136.195.37:5555/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;