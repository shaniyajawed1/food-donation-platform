import axios from 'axios';

// ✅ API Base URL pointing to port 9000
const API_BASE_URL = 'http://localhost:9900/api';

// ✅ Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ Add timeout
  timeout: 10000,
});

// ✅ Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => {
    console.log('🔐 Registering user:', userData.email);
    return api.post('/auth/register', userData);
  },
  login: (credentials) => {
    console.log('🔐 Logging in user:', credentials.email);
    return api.post('/auth/login', credentials);
  },
};

// Donation API
export const donationAPI = {
  getAll: () => {
    console.log('📦 Fetching all donations');
    return api.get('/donations');
  },
  create: (donationData) => {
    console.log('📦 Creating donation:', donationData.foodType);
    return api.post('/donations', donationData);
  },
  getMyDonations: (userId) => {
    console.log('📦 Fetching donations for user:', userId);
    return api.get('/users/' + userId + '/donations');
  },
};

// Request API  
export const requestAPI = {
  create: (requestData) => {
    console.log('📬 Creating request for donation:', requestData.donationId);
    return api.post('/requests', requestData);
  },
  getMyRequests: (userId) => {
    console.log('📬 Fetching requests for user:', userId);
    return api.get('/users/' + userId + '/requests');
  },
  updateStatus: (donationId, statusData) => {
    console.log('📬 Updating donation status:', donationId);
    return api.put('/donations/' + donationId, statusData);
  },
};

// Health check
export const healthCheck = () => {
  console.log('🏥 Checking API health');
  return api.get('/health');
};

export default api;