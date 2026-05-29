import axios from 'axios';
import { getToken } from '../auth/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error('Acceso denegado'));
    }
    return Promise.reject(error);
  },
);
