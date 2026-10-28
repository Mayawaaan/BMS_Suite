import { apiClient } from '../../core/services/apiClient';

export const productsService = {
  async getAll(businessType = 'all') {
    const query = businessType && businessType !== 'all' ? `?businessType=${businessType}` : '';
    const res = await apiClient.get(`/products${query}`);
    return res.data;
  },

  async create(productData) {
    const res = await apiClient.post('/products', productData);
    return res.data;
  },

  async update(id, data) {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/products/${id}`);
    return res;
  },
};
