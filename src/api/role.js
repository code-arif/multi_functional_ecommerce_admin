import { client } from './index'

export const roleApi = {
  list:            p      => client.get('/admin/rbac/roles', { params: p }),
  store:           d      => client.post('/admin/rbac/roles/store', d),
  show:            id     => client.get(`/admin/rbac/roles/${id}/show`),
  update:          (id,d) => client.put(`/admin/rbac/roles/${id}/update`, d),
  destroy:         id     => client.delete(`/admin/rbac/roles/${id}/destroy`),
  syncPermissions: (id,d) => client.post(`/admin/rbac/roles/${id}/permissions`, d),
}

export const adminStaffApi = {
  list:            p      => client.get('/admin/rbac/admins', { params: p }),
  stats:           ()     => client.get('/admin/rbac/admins/stats'),
  show:            id     => client.get(`/admin/rbac/admins/${id}`),
  store:           d      => client.post('/admin/rbac/admins', d),
  update:          (id,d) => client.put(`/admin/rbac/admins/${id}`, d),
  updateStatus:    (id,s) => client.patch(`/admin/rbac/admins/${id}/status`, { status: s }),
  destroy:         id     => client.delete(`/admin/rbac/admins/${id}`),
  assignRoles:     d      => client.post('/admin/rbac/users/assign', d),
  userPermissions: id     => client.get(`/admin/rbac/users/${id}/permissions`),
}
