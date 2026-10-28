import { apiClient } from '../../core/services/apiClient';

export const billsService = {
  async getAll(businessType = 'all') {
    const query = businessType && businessType !== 'all' ? `?businessType=${businessType}` : '';
    const res = await apiClient.get(`/bills${query}`);
    return res.data;
  },

  async create(billData) {
    const res = await apiClient.post('/bills', billData);
    return res.data;
  },

  async updateStatus(id, status) {
    const res = await apiClient.put(`/bills/${id}/status`, { status });
    return res.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/bills/${id}`);
    return res;
  },
};
