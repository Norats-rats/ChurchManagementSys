import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Authentication
  login: (credentials) => apiClient.post('/login', credentials),
  register: (formData) => apiClient.post('/register', formData),

  // Members
  getMembers: () => apiClient.get('/api/members'),
  createMember: (memberData) => apiClient.post('/api/members', memberData),
  updateMember: (id, memberData) => apiClient.put(`/api/members/${id}`, memberData),
  deleteMember: (id) => apiClient.delete(`/api/members/${id}`),

  // Events
getEvents: () => apiClient.get('/events'),
  createEvent: (eventData) => apiClient.post('/events', eventData),
  updateEvent: (id, eventData) => apiClient.put(`/events/${id}`), 
  deleteEvent: (id) => apiClient.delete(`/events/${id}`),

  // Attendance
  getAttendance: () => apiClient.get('/api/attendance'),
  recordAttendance: (checkInData) => apiClient.post('/api/attendance', checkInData),

  // Finances
  getFinances: () => apiClient.get('/api/finances'),
  addFinanceRecord: (transactionData) => apiClient.post('/api/finances', transactionData),

  // Ministries
  getMinistries: () => apiClient.get('/api/ministries'),
  createMinistry: (ministryData) => apiClient.post('/api/ministries', ministryData),
  updateMinistry: (id, editFormData) => apiClient.patch(`/api/ministries/${id}`, editFormData),
  deleteMinistry: (id) => apiClient.delete(`/api/ministries/${id}`),

  // Prayers
  getPrayers: () => apiClient.get('/api/prayers'),
  submitPrayer: (newEntry) => apiClient.post('/api/prayers', newEntry),
};

export default api;