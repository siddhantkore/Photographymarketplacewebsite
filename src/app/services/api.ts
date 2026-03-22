// API Service Layer - Central place for all API calls

const API_BASE_URL = 'http://localhost:5000/api/v1';
console.log('API_BASE_URL:', API_BASE_URL);

const safeParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// Token management
const getToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// API client with automatic token refresh
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const responseText = await response.text();
      const responseJson = isJson ? safeParseJson(responseText) : null;

      // Handle 401 - Try to refresh token
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request
          headers['Authorization'] = `Bearer ${getToken()}`;
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
            ...config,
            headers,
          });
          if (!retryResponse.ok) {
            const retryContentType = retryResponse.headers.get('content-type') || '';
            const retryIsJson = retryContentType.includes('application/json');
            const errorText = await retryResponse.text();
            const errorJson = retryIsJson ? safeParseJson(errorText) : null;
            let errorMessage = `HTTP error! status: ${retryResponse.status}`;
            if (errorJson && typeof errorJson === 'object' && 'message' in errorJson) {
              errorMessage = (errorJson as any).message || errorMessage;
            } else if (errorText) {
              errorMessage = errorText;
            } else {
              errorMessage = retryResponse.statusText || errorMessage;
            }
            throw new Error(errorMessage);
          }
          const retryContentType = retryResponse.headers.get('content-type') || '';
          const retryIsJson = retryContentType.includes('application/json');
          const retryText = await retryResponse.text();
          if (retryIsJson) {
            const retryJson = safeParseJson(retryText);
            if (retryJson !== null) return retryJson;
            throw new Error('Invalid JSON response from server');
          }
          return (retryText ? (retryText as unknown as T) : ({} as T));
        } else {
          clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (responseJson && typeof responseJson === 'object' && 'message' in responseJson) {
          errorMessage = (responseJson as any).message || errorMessage;
        } else if (responseText) {
          errorMessage = responseText;
        } else {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      if (isJson) {
        if (responseJson !== null) return responseJson;
        throw new Error('Invalid JSON response from server');
      }
      return (responseText ? (responseText as unknown as T) : ({} as T));
    } catch (error) {
      console.error('API request failed:', error);
      
      // Better error messages for network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running on http://localhost:5000');
      }
      
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return false;
      }
      const data = await response.json();
      if (data.success && data.data.accessToken) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const responseText = await response.text();
    const responseJson = isJson ? safeParseJson(responseText) : null;

    if (!response.ok) {
      if (responseJson && typeof responseJson === 'object' && 'message' in responseJson) {
        throw new Error((responseJson as any).message);
      }
      throw new Error(responseText || `HTTP error! status: ${response.status}`);
    }

    if (isJson) {
      if (responseJson !== null) return responseJson;
      throw new Error('Invalid JSON response from server');
    }
    return (responseText ? (responseText as unknown as T) : ({} as T));
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  logout: () => {
    const refreshToken = getRefreshToken();
    clearTokens();
    return apiClient.post('/auth/logout', { refreshToken });
  },

  getProfile: () => apiClient.get('/auth/me'),

  updateProfile: (data: { name?: string; email?: string }) =>
    apiClient.put('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
};

// Products API
export const productsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    orientation?: string;
    sort?: string;
    order?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiClient.get(`/products/${id}`),

  create: (data: any) => apiClient.post('/products', data),

  update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: (params?: { status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/categories${query ? `?${query}` : ''}`);
  },

  create: (data: any) => apiClient.post('/categories', data),

  update: (id: string, data: any) => apiClient.put(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

// Cart API
export const cartApi = {
  get: () => apiClient.get('/cart'),

  add: (data: { productId: string; resolution: string }) =>
    apiClient.post('/cart', data),

  remove: (productId: string, resolution: string) =>
    apiClient.delete(`/cart/items/${productId}/${resolution}`),

  clear: () => apiClient.delete('/cart'),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/orders${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiClient.get(`/orders/${id}`),

  create: (data: { paymentMethod: string; paymentDetails?: any }) =>
    apiClient.post('/orders', data),

  verifyPayment: (
    id: string,
    data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ) => apiClient.post(`/orders/${id}/verify-payment`, data),

  generateDownloadLink: (data: {
    orderId: string;
    productId: string;
    resolution: string;
  }) => apiClient.post('/orders/generate-link', data),

  // Admin
  getAllAdmin: (params?: any) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/orders/admin/all${query ? `?${query}` : ''}`);
  },
};

// Advertisements API
export const advertisementsApi = {
  getAll: (params?: { position?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/advertisements${query ? `?${query}` : ''}`);
  },

  create: (data: any) => apiClient.post('/admin/advertisements', data),

  update: (id: string, data: any) =>
    apiClient.put(`/admin/advertisements/${id}`, data),

  delete: (id: string) => apiClient.delete(`/admin/advertisements/${id}`),

  getGoogleAdSettings: () =>
    apiClient.get('/advertisements/google-ads/settings'),

  updateGoogleAdSettings: (data: any) =>
    apiClient.put('/admin/advertisements/google-ads/settings', data),
};

// Media API
export const mediaApi = {
  upload: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return apiClient.upload('/media/upload', formData);
  },

  delete: (key: string) => apiClient.post('/media/delete', { key }),
};

// Export token utilities
export { getToken, getRefreshToken, setTokens, clearTokens };
