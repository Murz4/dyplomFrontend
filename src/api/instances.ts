import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import store from 'src/common/store/store.ts';
import { refreshAccessToken } from 'common/store/slicer/userSlice.ts';

// Расширяем InternalAxiosRequestConfig для поддержки `_retry`
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Типизация состояния пользователя
interface UserState {
  access: string | null;
  refresh: string | null;
}

// Типизация состояния store
interface RootState {
  user: UserState;
}

const apiClient = axios.create({
  baseURL: 'http://13.51.239.26:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Добавляем access token в заголовки запроса
apiClient.interceptors.request.use((config: CustomAxiosRequestConfig): CustomAxiosRequestConfig => {
  const state: RootState = store.getState();
  const accessToken = state.user.access;

  if (accessToken) {
    // Убедимся, что заголовки корректно инициализированы
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Обработка ответа с проверкой ошибки 401
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Обновляем токен
      await store.dispatch(refreshAccessToken());
      const state: RootState = store.getState();
      const newAccessToken = state.user.access;

      if (newAccessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
