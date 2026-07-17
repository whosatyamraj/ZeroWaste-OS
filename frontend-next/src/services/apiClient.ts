import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { clearAuth, setCredentials } from '../store/slices/authSlice';

// Create Axios Instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies if needed
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Pass tenant ID if required by some endpoints
    if (state.auth.user?.tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = state.auth.user.tenantId;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized globally (Token Expiration)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        store.dispatch(clearAuth());
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Save new tokens to Redux
        store.dispatch(
          setCredentials({
            accessToken,
            refreshToken: newRefreshToken,
            user: state.auth.user,
          })
        );

        // Update authorization header and retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out the user
        store.dispatch(clearAuth());
        return Promise.reject(refreshError);
      }
    }

    // General Error Handling
    const errorMessage = (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
    
    // We could dispatch a toast notification here if desired
    // store.dispatch(addNotification({ type: 'error', message: errorMessage }));

    return Promise.reject({ ...error, message: errorMessage });
  }
);

export default apiClient;
