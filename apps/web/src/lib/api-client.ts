import axios, { type AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API error', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  },
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}

export const endpoints = {
  fields: '/fields',
  analyses: '/analyses',
  insights: '/insights',
  uploads: '/uploads/presign',
  webhook: '/webhooks/stripe',
  integrations: '/integrations',
};
