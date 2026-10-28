import { apiClient } from './apiClient';

export const employeeService = {
  /**
   * Get all company employees for the active tenant
   */
  async getEmployees(tenantId) {
    try {
      const url = tenantId ? `/employees?tenantId=${tenantId}` : '/employees';
      const res = await apiClient.get(url);
      return res;
    } catch (err) {
      console.warn('[employeeService.getEmployees error]:', err.message);
      return { success: false, data: [], metrics: {} };
    }
  },

  /**
   * Add a new employee to the company
   */
  async createEmployee(employeeData) {
    return await apiClient.post('/employees', employeeData);
  },

  /**
   * Update an employee's role, department, status, or details
   */
  async updateEmployee(employeeId, updateData) {
    return await apiClient.put(`/employees/${employeeId}`, updateData);
  },

  /**
   * Delete an employee from the company workforce
   */
  async deleteEmployee(employeeId) {
    return await apiClient.delete(`/employees/${employeeId}`);
  },
};

export default employeeService;
