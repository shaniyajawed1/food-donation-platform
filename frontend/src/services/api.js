import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9900/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request');
    }
    
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.message);
    
    if (error.response) {
      console.error('Error details:', error.response.data);
      if (error.response.status === 401) {
        console.warn('Unauthorized - clearing auth and redirecting to login');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Check if backend is running on http://localhost:9900');
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => {
    console.log('Registering user:', userData.email);
    return api.post('/auth/register', userData);
  },
  login: (credentials) => {
    console.log('Logging in user:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  getCurrentUser: () => {
    console.log('Fetching current user');
    return api.get('/auth/me');
  }
};

export const donationAPI = {
  getAll: () => {
    console.log('Fetching all donations');
    return api.get('/donations/available');
  },
  create: (donationData) => {
    console.log('Creating donation:', donationData.foodType);
    return api.post('/donations', donationData);
  },
  getMyDonations: () => {
    console.log('Fetching my donations (authenticated)');
    return api.get('/donations/my-donations');
  },
  updateStatus: (donationId, statusData) => {
    console.log('Updating donation status:', donationId);
    return api.patch(`/donations/${donationId}/status`, statusData);
  },
  claimDonation: (donationId) => {
    console.log('Claiming donation:', donationId);
    return api.patch(`/donations/${donationId}/claim`);
  },
  delete: (donationId) => {
    console.log('Deleting donation with ID:', donationId);
    console.log('Full URL will be:', `${API_BASE_URL}/donations/${donationId}`);
    return api.delete(`/donations/${donationId}`);
  }
};

export const requestAPI = {
  create: (requestData) => {
    console.log('Creating request for donation:', requestData.donationId);
    return api.post('/requests', requestData);
  },
  getMyRequests: (userId) => {
    console.log('Fetching requests for user:', userId);
    return api.get(`/users/${userId}/requests`);
  },
  delete: (requestId) => {
    console.log('Deleting request with ID:', requestId);
    return api.delete(`/requests/${requestId}`);
  }
};

export const healthCheck = () => {
  console.log('Checking API health');
  return api.get('/health');
};

export default api;