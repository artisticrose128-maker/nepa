import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
};

export const sanitizeEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email);
  return emailRegex.test(sanitized) ? sanitized : '';
};

export const sanitizePhoneNumber = (phone: string): string => {
  const sanitized = sanitizeInput(phone);
  return sanitized.replace(/[^\d+\-\s()]/g, '');
};

export const sanitizeUrl = (url: string): string => {
  try {
    const sanitized = sanitizeInput(url);
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return sanitized;
    }
    return '';
  } catch {
    return '';
  }
};

export const validateAndSanitize = (value: any, type: 'string' | 'email' | 'phone' | 'url' | 'number'): any => {
  switch (type) {
    case 'string':
      return typeof value === 'string' ? sanitizeInput(value) : '';
    case 'email':
      return typeof value === 'string' ? sanitizeEmail(value) : '';
    case 'phone':
      return typeof value === 'string' ? sanitizePhoneNumber(value) : '';
    case 'url':
      return typeof value === 'string' ? sanitizeUrl(value) : '';
    case 'number':
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    default:
      return value;
  }
};

// API client with security features
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for sanitization
    this.client.interceptors.request.use(
      (config) => {
        if (config.data) {
          config.data = this.sanitizeRequestData(config.data);
        }
        if (config.params) {
          config.params = this.sanitizeRequestData(config.params);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private sanitizeRequestData(data: any): any {
    if (typeof data === 'string') {
      return sanitizeInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeRequestData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();

// Specific API endpoints with validation
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post('/auth/login', {
      email: validateAndSanitize(credentials.email, 'email'),
      password: validateAndSanitize(credentials.password, 'string')
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    return apiClient.post('/auth/register', {
      email: validateAndSanitize(userData.email, 'email'),
      password: validateAndSanitize(userData.password, 'string'),
      firstName: validateAndSanitize(userData.firstName, 'string'),
      lastName: validateAndSanitize(userData.lastName, 'string')
    });
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  }
};

export const userApi = {
  getProfile: async () => {
    return apiClient.get('/user/profile');
  },

  updateProfile: async (profileData: any) => {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(profileData)) {
      if (key === 'email') {
        sanitized[key] = validateAndSanitize(value as string, 'email');
      } else if (key === 'phone') {
        sanitized[key] = validateAndSanitize(value as string, 'phone');
      } else {
        sanitized[key] = validateAndSanitize(value as string, 'string');
      }
    }
    return apiClient.put('/user/profile', sanitized);
  }
};

export default apiClient;
