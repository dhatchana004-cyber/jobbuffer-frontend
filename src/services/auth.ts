import api from './api';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      const user = response.data.user || {};
      const normEmail = (credentials.email || user.email || '').toLowerCase().trim();

      // Normalize role based on credentials or known admin/recruiter patterns
      if (normEmail === 'admin@mail.com' || normEmail.startsWith('admin@') || credentials.role === 'ADMIN') {
        user.role = 'ADMIN';
      } else if ((credentials.role === 'RECRUITER' || user.role === 'RECRUITER') && user.role !== 'ADMIN') {
        user.role = 'RECRUITER';
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      response.data.user = user;
    }
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }
};
