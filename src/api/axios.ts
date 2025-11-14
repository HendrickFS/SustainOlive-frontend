import axios from 'axios';

const api = axios.create({
  // If VITE_API_URL is set (absolute or relative), use it; otherwise default to same-origin '/'
  baseURL: import.meta.env.VITE_API_URL ?? '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const historicalApi = axios.create({
  // If VITE_HISTORICAL_API_URL is set, use it; otherwise default to same-origin '/historical/'
  baseURL: import.meta.env.VITE_HISTORICAL_API_URL ?? '/historical',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;