import { client } from './index'

export const categoryApi = {
  list:    p  => client.get('/admin/categories', { params: p }),
  show:    uuid => client.get(`/admin/categories/${uuid}`),
  store:   d  => client.post('/admin/categories/store', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (uuid,d) => client.post(`/admin/categories/${uuid}/update?_method=PUT`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  destroy: uuid => client.delete(`/admin/categories/${uuid}/delete`),
}
