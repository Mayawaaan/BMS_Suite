import { apiClient } from '../../core/services/apiClient';

export const stockService = {
  async getAll(businessType = 'all') {
    const query = businessType && businessType !== 'all' ? `?businessType=${businessType}` : '';
    const res = await apiClient.get(`/stock${query}`);
    return res.data;
  },

  async create(stockData) {
    const res = await apiClient.post('/stock', stockData);
    return res.data;
  },

  async updateLevel(id, currentStock, warehouse) {
    const res = await apiClient.put(`/stock/${id}`, { currentStock, warehouse });
    return res.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/stock/${id}`);
    return res;
  },
};
