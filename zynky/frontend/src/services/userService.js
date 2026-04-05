// ============================================================
//  src/services/userService.js  — SERVICE layer (Frontend)
//
//  หน้าที่: รวม function ที่ติดต่อกับ /api/users
// ============================================================

import api from './api';

const userService = {
  // POST /api/users/register
  register: (data) => api.post('/users/register', data),

  // POST /api/users/login → response มี { token, data: user }
  login: (email, password) => api.post('/users/login', { email, password }),

  // GET /api/users/me
  getMe: () => api.get('/users/me'),

  // PUT /api/users/me
  updateMe: (data) => api.put('/users/me', data),

  // POST /api/users/save/:postId
  toggleSave: (postId) => api.post(`/users/save/${postId}`),
};

export default userService;
