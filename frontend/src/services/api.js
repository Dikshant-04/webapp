import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem('access_token', access)

          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  
  // Password Reset
  passwordResetRequest: (data) => api.post('/auth/password-reset/request/', data),
  passwordResetValidateToken: (data) => api.post('/auth/password-reset/validate-token/', data),
  passwordResetConfirm: (data) => api.post('/auth/password-reset/confirm/', data),
}

// User APIs
export const userAPI = {
  getMe: () => api.get('/users/me/'),
  updateMe: (data) => api.patch('/users/me/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
  getPublicProfile: (username) => api.get(`/users/profile/?username=${username}`),
  getPublicProfiles: (params) => api.get('/users/profiles/', { params }),
  
  // Staff
  getStaffProfile: () => api.get('/users/staff/profile/'),
  updateStaffProfile: (data) => api.patch('/users/staff/profile/', data),
  
  // Admin
  adminGetUsers: (params) => api.get('/users/admin/users/', { params }),
  adminGetUser: (id) => api.get(`/users/admin/users/${id}/`),
  adminCreateUser: (data) => api.post('/users/admin/users/', data),
  adminUpdateUser: (id, data) => api.patch(`/users/admin/users/${id}/`, data),
  adminDeleteUser: (id) => api.delete(`/users/admin/users/${id}/`),
  adminUpdateUserRole: (id, role) => api.patch(`/users/admin/users/${id}/role/`, { role }),
  adminGetStats: () => api.get('/users/admin/stats/'),
}

// Blog APIs
export const blogAPI = {
  // Public
  getBlogs: (params) => api.get('/blogs/', { params }),
  getBlog: (slug) => api.get(`/blogs/${slug}/`),
  getFeatured: () => api.get('/blogs/featured/'),
  getBlogsByUser: (username) => api.get(`/blogs/user/${username}/`),
  getCategories: () => api.get('/blogs/categories/'),
  getTags: () => api.get('/blogs/tags/'),
  createComment: (slug, data) => api.post(`/blogs/${slug}/comments/`, data),
  
  // Staff
  staffGetBlogs: (params) => api.get('/blogs/staff/', { params }),
  staffGetBlog: (id) => api.get(`/blogs/staff/${id}/`),
  staffCreateBlog: (data) => api.post('/blogs/staff/', data),
  staffUpdateBlog: (id, data) => api.patch(`/blogs/staff/${id}/`, data),
  staffDeleteBlog: (id) => api.delete(`/blogs/staff/${id}/`),
  
  // Admin
  adminGetBlogs: (params) => api.get('/blogs/admin/', { params }),
  adminGetBlog: (id) => api.get(`/blogs/admin/${id}/`),
  adminUpdateBlog: (id, data) => api.patch(`/blogs/admin/${id}/`, data),
  adminDeleteBlog: (id) => api.delete(`/blogs/admin/${id}/`),
  adminUpdateStatus: (id, status) => api.patch(`/blogs/admin/${id}/status/`, { status }),
  adminToggleFeatured: (id) => api.patch(`/blogs/admin/${id}/featured/`),
  adminGetStats: () => api.get('/blogs/admin/stats/'),
  
  // Categories & Tags (Admin)
  adminGetCategories: () => api.get('/blogs/admin/categories/'),
  adminCreateCategory: (data) => api.post('/blogs/admin/categories/', data),
  adminUpdateCategory: (id, data) => api.patch(`/blogs/admin/categories/${id}/`, data),
  adminDeleteCategory: (id) => api.delete(`/blogs/admin/categories/${id}/`),
  
  adminGetTags: () => api.get('/blogs/admin/tags/'),
  adminCreateTag: (data) => api.post('/blogs/admin/tags/', data),
  adminUpdateTag: (id, data) => api.patch(`/blogs/admin/tags/${id}/`, data),
  adminDeleteTag: (id) => api.delete(`/blogs/admin/tags/${id}/`),
}

// Analytics APIs
export const analyticsAPI = {
  // Public
  submitContact: (data) => api.post('/analytics/contact/', data),
  
  // Admin
  getDashboard: () => api.get('/analytics/dashboard/'),
  getDailyAnalytics: (days) => api.get('/analytics/daily/', { params: { days } }),
  getMonthlyAnalytics: (months) => api.get('/analytics/monthly/', { params: { months } }),
  getBlogViews: (blogId) => api.get('/analytics/views/', { params: { blog_id: blogId } }),
  getBlogAnalytics: (id) => api.get(`/analytics/blog/${id}/`),
  
  // Contacts
  getContacts: (params) => api.get('/analytics/admin/contacts/', { params }),
  getContact: (id) => api.get(`/analytics/admin/contacts/${id}/`),
  updateContact: (id, data) => api.patch(`/analytics/admin/contacts/${id}/`, data),
  deleteContact: (id) => api.delete(`/analytics/admin/contacts/${id}/`),
  markContactReplied: (id) => api.post(`/analytics/admin/contacts/${id}/reply/`),
  getContactStats: () => api.get('/analytics/admin/contacts/stats/'),
}

export default api
