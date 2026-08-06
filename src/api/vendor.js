import { client } from './index'

export const vendorApi = {
  list:         p      => client.get('/admin/vendors', { params: p }),
  pending:      p      => client.get('/admin/vendors/pending', { params: p }),
  show:         id     => client.get(`/admin/vendors/${id}`),
  create:       d      => client.post('/admin/vendors/store', d),
  updateStatus: (id,s) => client.patch(`/admin/vendors/${id}/status`, { status: s }),
  approve:      id     => client.post(`/admin/vendors/${id}/approve`),
  reject:       (id,reason) => client.post(`/admin/vendors/${id}/reject`, { reason }),
  suspend:      (id,reason) => client.post(`/admin/vendors/${id}/suspend`, { reason }),
  makePending:  id     => client.post(`/admin/vendors/${id}/pending`),
  update:       (id,d) => client.post(`/admin/vendors/${id}?_method=PUT`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  destroy:      id     => client.delete(`/admin/vendors/${id}`),
  // Payouts
  payouts:      p      => client.get('/admin/vendor-payouts', { params: p }),
  payoutCreate: d      => client.post('/admin/vendor-payouts', d),
  payoutApprove: id   => client.post(`/admin/vendor-payouts/${id}/approve`),
  payoutReject: (id,reason) => client.post(`/admin/vendor-payouts/${id}/reject`, { reason }),
  payoutSummary: ()   => client.get('/admin/vendor-payouts/summary'),
}
