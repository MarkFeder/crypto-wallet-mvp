import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../common/constants/config';
import { storageService } from './storageService';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Required for HttpOnly cookies
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      response => response,
      error => {
        // A 401 from submitting credentials means they were rejected, not that
        // the session expired. Redirecting on it would reload the page and wipe
        // the error before the form could show it.
        const url: string = error.config?.url || '';
        const isCredentialSubmit =
          url.includes(API_ENDPOINTS.AUTH.LOGIN) || url.includes(API_ENDPOINTS.AUTH.REGISTER);

        if (error.response?.status === 401 && !isCredentialSubmit) {
          storageService.clearAuth();
          window.location.href = '/login';
        }

        // Surface the server's own message. Without this a rejected login reads
        // only "Request failed with status code 401", which explains nothing.
        const serverMessage = error.response?.data?.error;
        if (typeof serverMessage === 'string' && serverMessage) {
          error.message = serverMessage;
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
