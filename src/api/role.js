import { client } from './index'

export const roleApi = {
  list:            p  => client.get('/admin/rbac/roles', { params: p }),
  store:           d  => client.post('/admin/rbac/roles/store', d),
  show:            id => client.get(`/admin/rbac/roles/${id}/show`),
  update:          (id, d) => client.put(`/admin/rbac/roles/${id}/update`, d),
  destroy:         id => client.delete(`/admin/rbac/roles/${id}/destroy`),
  syncPermissions: (id, d) => client.post(`/admin/rbac/roles/${id}/permissions`, d),
}
