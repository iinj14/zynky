// ============================================================
//  routes/postRoutes.js  — ROUTE layer
//
//  หน้าที่: กำหนดว่า HTTP method + path ไหน → เรียก Controller function ไหน
//          บาง route ต้องผ่าน authMiddleware ก่อน (protect)
//
//  ลงทะเบียนใน server.js ด้วย:
//    app.use('/api/posts', require('./routes/postRoutes'))
//
//  ดังนั้น path ใน file นี้จะนำหน้าด้วย /api/posts เสมอ
//    เช่น  router.get('/')     →  GET  /api/posts
//          router.post('/')    →  POST /api/posts
//          router.delete('/:id') → DELETE /api/posts/:id
// ============================================================

const express = require('express');
const router = express.Router();

// เรียก Controller functions
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} = require('../controllers/PostController');

// Middleware ตรวจสอบ login
const { protect } = require('../middleware/authMiddleware');

// ──── PUBLIC routes (ไม่ต้อง login) ────
router.get('/', getPosts);              // GET  /api/posts
router.get('/:id', getPostById);        // GET  /api/posts/:id

// ──── PROTECTED routes (ต้อง login → ผ่าน protect ก่อน) ────
router.post('/', protect, createPost);               // POST   /api/posts
router.put('/:id', protect, updatePost);             // PUT    /api/posts/:id
router.delete('/:id', protect, deletePost);          // DELETE /api/posts/:id
router.post('/:id/like', protect, toggleLike);       // POST   /api/posts/:id/like

module.exports = router;
