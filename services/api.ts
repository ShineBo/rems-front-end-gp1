// /services/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with every request
});

// Add interceptor to include auth token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication services
export const authService = {
  async buyerLogin(email: string, password: string) {
    const response = await api.post('/auth/buyer/login', { email, password });
    return response.data;
  },

  async dealerLogin(email: string, password: string) {
    const response = await api.post('/auth/dealer/login', { email, password });
    return response.data;
  },

  async registerBuyer(buyerData: {
    buyerName: string;
    email: string;
    password: string;
    phoneNumber: string;
    profilePhoto: string | null;
  }) {
    const response = await api.post('/buyer', buyerData);
    return response.data;
  },

  async registerDealer(dealerData: {
    businessName: string;
    licenseNumber: string;
    email: string;
    password: string;
    phoneNumber: string;
    profilePhoto: string | null;
  }) {
    const response = await api.post('/dealer', dealerData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
  
    // Clear the token from cookies too
    document.cookie = 'accessToken=; path=/; max-age=0';
  },

  getCurrentUser() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  setAuthData(accessToken: string, user: any) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userInfo', JSON.stringify(user));
  
    // Store access token in cookies (expires in 7 days)
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }
};

// User profile services
export const profileService = {
  // Get buyer profile by ID
  async getBuyerProfile(buyerId: number) {
    const response = await api.get(`/buyer/${buyerId}`);
    return response.data;
  },

  // Get dealer profile by ID
  async getDealerProfile(dealerId: number) {
    const response = await api.get(`/dealer/${dealerId}`);
    return response.data;
  },

  // Update buyer profile
  async updateBuyerProfile(buyerId: number, profileData: any) {
    const response = await api.patch(`/buyer/${buyerId}`, profileData);
    return response.data;
  },

  // Update dealer profile
  async updateDealerProfile(dealerId: number, profileData: any) {
    const response = await api.patch(`/dealer/${dealerId}`, profileData);
    return response.data;
  },

  // Upload profile photo (if you want to handle this separately)
  async uploadProfilePhoto(userId: number, role: 'buyer' | 'dealer', photoFile: File) {
    const formData = new FormData();
    formData.append('profilePhoto', photoFile);
    
    const endpoint = role === 'buyer' ? `/buyer/${userId}/photo` : `/dealer/${userId}/photo`;
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};

export default api;