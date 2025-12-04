import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken } from '@common/store/slicer/userSlice';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface UserState {
  access: string | null;
  refresh: string | null;
}

interface RootState {
  user: UserState;
}

const apiClient = axios.create({
  baseURL: 'https://diploma-thesis.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

let store: any = null;

export const setupInterceptors = (appStore: any) => {
  store = appStore;
};

apiClient.interceptors.request.use((config: CustomAxiosRequestConfig): CustomAxiosRequestConfig => {
  if (store) {
    const state: RootState = store.getState();
    const accessToken = state.user.access;

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry && store) {
      originalRequest._retry = true;

      try {
        await store.dispatch(refreshAccessToken());
        const state: RootState = store.getState();
        const newAccessToken = state.user.access;

        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
