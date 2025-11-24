import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authApi = {
  register: (data: { name?: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Evaluation APIs
export const evaluationApi = {
  evaluateIdea: (data: {
    roomId: string;
    problemStatement: string;
    idea: string;
    features: string[];
    techStack: string[];
  }) => api.post('/evaluate/idea', data),

  evaluateCode: (data: {
    roomId: string;
    code: string;
    fileName?: string;
    language?: string;
  }) => api.post('/evaluate/code', data),

  evaluateRepo: (data: {
    roomId: string;
    repoUrl: string;
  }) => api.post('/evaluate/repo', data),

  calculateFinalScore: (data: { roomId: string }) =>
    api.post('/evaluate/final', data),
};

// Report APIs
export const reportApi = {
  getLatestReport: () => api.get('/report/latest'),
  
  generateReport: (data: { roomId: string }) =>
    api.post('/report/generate', data),
  
  getReport: (roomId: string) =>
    api.get(`/report/${roomId}`),
};

// File Management APIs
export const fileApi = {
  uploadFile: (data: any) => api.post('/files/upload', data),
  getFiles: (roomId: string) => api.get(`/files/${roomId}`),
  deleteFile: (data: any) => api.delete('/files/delete', { data }),
  saveFile: (data: any) => api.put('/files/save', data),
};

export default api;
