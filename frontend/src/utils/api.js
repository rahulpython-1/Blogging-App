import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Blog APIs
export const blogAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getById: (id) => api.get(`/blogs/${id}`),
  getBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
  togglePublish: (id) => api.patch(`/blogs/${id}/publish`),
  generate: (data) => api.post('/blogs/generate', data),
  improve: (id, instruction) => api.post(`/blogs/${id}/improve`, { instruction }),
  getIdeas: (category, count) => api.post('/blogs/ideas', { category, count }),
  getStats: () => api.get('/blogs/stats/all')
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getPublishers: () => api.get('/users/publishers')
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Comment API
export const commentAPI = {
  // Get comments for a blog (public)
  getBlogComments: (blogId) => api.get(`/comments/blog/${blogId}`),
  
  // Create new comment (public)
  create: (data) => api.post('/comments', data),
  
  // Get all comments (admin)
  getAll: (params) => api.get('/comments', { params }),
  
  // Get comment stats (admin)
  getStats: () => api.get('/comments/stats'),
  
  // Approve/unapprove comment (admin)
  toggleApprove: (id) => api.patch(`/comments/${id}/approve`),
  
  // Delete comment (admin)
  delete: (id) => api.delete(`/comments/${id}`)
};

export default api;
