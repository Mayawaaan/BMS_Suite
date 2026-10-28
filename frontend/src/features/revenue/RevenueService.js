import { apiClient } from '../../core/services/apiClient';

export const revenueService = {
  async getAnalytics(businessType = 'all') {
    const query = businessType && businessType !== 'all' ? `?businessType=${businessType}` : '';
    const res = await apiClient.get(`/revenue${query}`);
    return res.data;
  },

  async updateTarget(targetData) {
    const res = await apiClient.put('/revenue/target', targetData);
    return res.data;
  },
};
