import { client } from './index'

export const permissionApi = {
  list:    p => client.get('/admin/rbac/permissions', { params: p }),
  store:   d => client.post('/admin/rbac/permissions/store', d),
  show:    id => client.get(`/admin/rbac/permissions/${id}`),
  update:  (id, d) => client.put(`/admin/rbac/permissions/${id}/update`, d),
  destroy: id => client.delete(`/admin/rbac/permissions/${id}/destroy`),
  groups:  () => client.get('/admin/rbac/permissions/groups'),
  grouped: () => client.get('/admin/rbac/permissions/grouped'),
}
