import { client } from './index'

export const notificationApi = {
  list:          params => client.get('/notifications', { params }),
  markAsRead:    id     => client.post(`/notifications/${id}/read`),
  markAllAsRead: ()     => client.post('/notifications/read-all'),
  destroy:       id     => client.delete(`/notifications/${id}`),
  destroyAll:    ()     => client.delete('/notifications'),
}
