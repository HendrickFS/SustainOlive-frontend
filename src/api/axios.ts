import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const historicalApi = axios.create({
  baseURL: import.meta.env.VITE_HISTORICAL_API_URL || 'http://localhost:5555/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;