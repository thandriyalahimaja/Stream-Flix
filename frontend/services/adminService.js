/**
 * Admin API service
 */
import api from './api';

const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  exportSeed: () => api.get('/admin/export-seed'),
  getDataQuality: () => api.get('/admin/data-quality'),
};

export default adminService;
