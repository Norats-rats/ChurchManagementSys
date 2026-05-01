import axios from 'axios';

// This pulls the URL from your Cloudflare Environment Variables[cite: 6]
const API_BASE = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Authentication & Users
  login: (credentials) => apiClient.post('/login', credentials), // Added login method[cite: 6]
  register: (formData) => apiClient.post('/register', formData),
  getMembers: () => apiClient.get('/api/members'),
  createMember: (memberData) => apiClient.post('/api/members', memberData),
  updateMember: (id, memberData) => apiClient.put(`/api/members/${id}`, memberData),
  deleteMember: (id) => apiClient.delete(`/api/members/${id}`),
  updateUserStatus: (id, status) => apiClient.patch(`/api/members/${id}`, { status }),

  // Events
  getEvents: () => apiClient.get('/api/events'),
  createEvent: (eventData) => apiClient.post('/api/events', eventData),
  updateEvent: (id, eventData) => apiClient.put(`/api/events/${id}`, eventData),
  deleteEvent: (id) => apiClient.delete(`/api/events/${id}`),
  toggleEventAttendance: (eventId, userId) => 
    apiClient.patch(`/api/events/${eventId}/attend`, { userId }),

  // Attendance Logs
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
  incrementPrayerCount: (id) => apiClient.patch(`/api/prayers/${id}/pray`),
  markPrayerAnswered: (id) => apiClient.patch(`/api/prayers/${id}/answer`),
};

export default api;