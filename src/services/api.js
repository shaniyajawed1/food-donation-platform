import axios from 'axios';

// ✅ CORRECTED: Changed from 3001 to 5000 to match your backend
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Donation API
export const donationAPI = {
  getAll: () => api.get('/donations'),
  create: (donationData) => api.post('/donations', donationData),
  getMyDonations: (userId) => api.get('/users/' + userId + '/donations'),
};

// Request API  
export const requestAPI = {
  create: (requestData) => api.post('/requests', requestData),
  getMyRequests: (userId) => api.get('/users/' + userId + '/requests'),
  updateStatus: (donationId, statusData) => api.put('/donations/' + donationId, statusData),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;