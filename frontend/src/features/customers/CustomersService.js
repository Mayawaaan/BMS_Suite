import { apiClient } from '../../core/services/apiClient';

export const customersService = {
  async getAll(businessType = 'all') {
    const query = businessType && businessType !== 'all' ? `?businessType=${businessType}` : '';
    const res = await apiClient.get(`/customers${query}`);
    return res.data;
  },

  async create(customerData) {
    const res = await apiClient.post('/customers', customerData);
    return res.data;
  },

  async update(id, customerData) {
    const res = await apiClient.put(`/customers/${id}`, customerData);
    return res.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/customers/${id}`);
    return res;
  },
};
