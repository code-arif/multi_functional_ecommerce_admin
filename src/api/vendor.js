import { client } from './index'

export const vendorApi = {
  list:             p           => client.get('/admin/vendors', { params: p }),
  stats:            ()          => client.get('/admin/vendors/stats'),
  pending:          p           => client.get('/admin/vendors/pending', { params: p }),
  show:             id          => client.get(`/admin/vendors/${id}`),
  create:           d           => client.post('/admin/vendors/store', d),
  updateStatus:     (id, s)     => client.patch(`/admin/vendors/${id}/status`, { status: s }),
  updateCommission: (id, d)     => client.put(`/admin/vendors/${id}/commission`, d),
  approve:          id          => client.post(`/admin/vendors/${id}/approve`),
  reject:           (id, reason)=> client.post(`/admin/vendors/${id}/reject`, { reason }),
  suspend:          (id, reason)=> client.post(`/admin/vendors/${id}/suspend`, { reason }),
  makePending:      id          => client.post(`/admin/vendors/${id}/pending`),
  update:           (id, d)     => client.post(`/admin/vendors/${id}?_method=PUT`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  destroy:          id          => client.delete(`/admin/vendors/${id}`),
  // Documents (KYC Queue & Single Vendor)
  documents:        p           => client.get('/admin/vendors/documents', { params: p }),
  verifyDocument:   docId       => client.post(`/admin/vendors/documents/${docId}/verify`),
  rejectDocument:   (docId, reason) => client.post(`/admin/vendors/documents/${docId}/reject`, { reason }),
  // Finance / Payouts (Modules/Finance)
  payouts:          p           => client.get('/admin/finance/payouts', { params: p }),
  payoutSummary:    ()          => client.get('/admin/finance/payouts/summary'),
  payoutApprove:    id          => client.post(`/admin/finance/payouts/${id}/approve`),
  payoutReject:     (id, reason)=> client.post(`/admin/finance/payouts/${id}/reject`, { reason }),
  payoutComplete:   id          => client.post(`/admin/finance/payouts/${id}/complete`),
  commissions:      p           => client.get('/admin/finance/commissions', { params: p }),
}
