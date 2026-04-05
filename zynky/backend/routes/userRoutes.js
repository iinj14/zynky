// ============================================================
//  routes/userRoutes.js
//  ลงทะเบียนใน server.js → /api/users/...
// ============================================================

const express = require('express');
const router = express.Router();

const { register, login, getMe, updateMe, toggleSavePost } = require('../controllers/UserController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/register', register);   // POST /api/users/register
router.post('/login', login);         // POST /api/users/login

// Protected (ต้อง login)
router.get('/me', protect, getMe);          // GET /api/users/me
router.put('/me', protect, updateMe);       // PUT /api/users/me
router.post('/save/:postId', protect, toggleSavePost); // POST /api/users/save/:postId

module.exports = router;
