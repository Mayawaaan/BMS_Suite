import { apiClient } from './apiClient';

export const authService = {
  async getDemoUsers() {
    try {
      const res = await apiClient.get('/auth/demo-users');
      return res;
    } catch (err) {
      console.warn('[authService getDemoUsers warning]:', err.message);
      return { success: false, data: [] };
    }
  },

  async login(credentials) {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      if (res && res.token) {
        localStorage.setItem('omnipulse_auth_token', res.token);
        if (res.user?.tenantId) {
          localStorage.setItem('omnipulse_tenant_id', res.user.tenantId);
        }
      }
      return res;
    } catch (err) {
      console.warn('[authService login error]:', err.message);
      return { success: false, message: err.message || 'Login failed. Please check your credentials.' };
    }
  },

  async register(userData) {
    try {
      const res = await apiClient.post('/auth/register', userData);
      if (res && res.token) {
        localStorage.setItem('omnipulse_auth_token', res.token);
        if (res.user?.tenantId) {
          localStorage.setItem('omnipulse_tenant_id', res.user.tenantId);
        }
      }
      return res;
    } catch (err) {
      console.warn('[authService register error]:', err.message);
      return { success: false, message: err.message || 'Registration failed.' };
    }
  },

  /**
   * Request 6-digit OTP code to reset password
   */
  async forgotPassword(email) {
    try {
      return await apiClient.post('/auth/forgot-password', { email });
    } catch (err) {
      return { success: false, message: err.message || 'Failed to dispatch verification code.' };
    }
  },

  /**
   * Verify 6-digit OTP code and retrieve reset token
   */
  async verifyOtp(email, otp) {
    try {
      return await apiClient.post('/auth/verify-otp', { email, otp });
    } catch (err) {
      return { success: false, message: err.message || 'Invalid or expired OTP code.' };
    }
  },

  /**
   * Reset password with resetToken & bcrypt salting
   */
  async resetPassword({ email, resetToken, newPassword, confirmPassword }) {
    try {
      return await apiClient.post('/auth/reset-password', {
        email,
        resetToken,
        newPassword,
        confirmPassword,
      });
    } catch (err) {
      return { success: false, message: err.message || 'Failed to reset password.' };
    }
  },

  async updatePortfolioVerticals(tenantId, verticals, purgedVerticals) {
    try {
      return await apiClient.put('/auth/portfolio/verticals', { tenantId, verticals, purgedVerticals });
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update portfolio.' };
    }
  },

  async purgePortfolioVertical(tenantId, vertical, replacementVertical) {
    try {
      return await apiClient.post('/auth/portfolio/purge-vertical', {
        tenantId,
        vertical,
        replacementVertical,
      });
    } catch (err) {
      return { success: false, message: err.message || 'Failed to purge vertical.' };
    }
  },

  async getPortfolioAnalytics(tenantId) {
    try {
      const headers = tenantId ? { 'x-tenant-id': tenantId } : {};
      const res = await apiClient.get('/revenue/portfolio-analytics', { headers });
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Failed to fetch portfolio analytics.' };
    }
  },

  async getMe() {
    try {
      const res = await apiClient.get('/auth/me');
      return res.user;
    } catch (err) {
      return null;
    }
  },
};

export default authService;
