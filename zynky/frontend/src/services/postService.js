// ============================================================
//  src/services/postService.js  — SERVICE layer (Frontend)
//
//  หน้าที่: รวม function ทุกอย่างที่ติดต่อกับ /api/posts
//          แยกออกมาจาก Component เพื่อให้ใช้ซ้ำได้
//
//  ลำดับการเรียก:
//    Component (SearchPage) → usePostService (hook)
//    → postService.getPosts() → api.js (axios) → Backend
// ============================================================

import api from './api';

const postService = {
  // ── ดึงโพสต์ทั้งหมด (พร้อม filter) ──
  // params: { category, q, page, limit }
  // → GET /api/posts?category=travel&q=เชียงใหม่
  getPosts: (params = {}) => api.get('/posts', { params }),

  // ── ดึงโพสต์ตาม ID ──
  // → GET /api/posts/:id
  getPostById: (id) => api.get(`/posts/${id}`),

  // ── สร้างโพสต์ใหม่ (ต้อง login) ──
  // data: { title, description, price, ... }
  // → POST /api/posts  (พร้อม token ใน header จาก api.js interceptor)
  createPost: (data) => api.post('/posts', data),

  // ── แก้ไขโพสต์ ──
  // → PUT /api/posts/:id
  updatePost: (id, data) => api.put(`/posts/${id}`, data),

  // ── ลบโพสต์ ──
  // → DELETE /api/posts/:id
  deletePost: (id) => api.delete(`/posts/${id}`),

  // ── Toggle like ──
  // → POST /api/posts/:id/like
  toggleLike: (id) => api.post(`/posts/${id}/like`),
};

export default postService;
