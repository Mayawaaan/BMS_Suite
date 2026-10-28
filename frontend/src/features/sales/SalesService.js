import { apiClient } from '../../core/services/apiClient';

export const salesService = {
  async getAll(businessType = 'all') {
    const query = businessType && businessType !== 'all' ? `?businessType=${businessType}` : '';
    const res = await apiClient.get(`/sales${query}`);
    return res.data;
  },

  async create(dealData) {
    const res = await apiClient.post('/sales', dealData);
    return res.data;
  },

  async updateStage(id, stage, probability) {
    const res = await apiClient.put(`/sales/${id}/stage`, { stage, probability });
    return res.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/sales/${id}`);
    return res;
  },
};
