import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    getLeaderboard: () => api.get('/auth/leaderboard'),
};

// Issues API
export const issuesAPI = {
    getAll: (params) => api.get('/issues', { params }),
    getById: (id) => api.get(`/issues/${id}`),
    create: (formData) => api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    updateStatus: (id, data) => api.put(`/issues/${id}/status`, data),
    upvote: (id) => api.post(`/issues/${id}/upvote`),
    verify: (id, data) => api.post(`/issues/${id}/verify`, data),
    comment: (id, data) => api.post(`/issues/${id}/comment`, data),
    getMyIssues: () => api.get('/issues/user/my-issues'),
};

// Analytics API
export const analyticsAPI = {
    getStats: () => api.get('/analytics/stats'),
    getHeatmap: () => api.get('/analytics/heatmap'),
    getDepartments: () => api.get('/analytics/departments'),
    getPriorityQueue: () => api.get('/analytics/priority-queue'),
    getActivity: () => api.get('/analytics/activity'),
};

export default api;
