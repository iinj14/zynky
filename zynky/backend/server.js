// ============================================================
//  server.js  — จุดเริ่มต้นของ Backend ทั้งหมด
//
//  ลำดับการทำงาน:
//  1. โหลด Express + middleware
//  2. เชื่อม MongoDB
//  3. ลงทะเบียน Routes (/api/posts, /api/users, /api/chats)
//  4. เปิด server รอรับ request บน port 5000
//
//  Frontend (React) จะส่ง HTTP Request มาที่ http://localhost:5000
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// โหลด environment variables จากไฟล์ .env
dotenv.config();

const app = express();

// ──────────────────────────────────────────
//  MIDDLEWARE  (ทำงานก่อน request ทุกตัว)
// ──────────────────────────────────────────

// อนุญาตให้ React (localhost:3000) เรียก API ได้
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// แปลง request body จาก JSON string → JavaScript object
app.use(express.json());

// Log ทุก request เพื่อ debug (แสดง method + path)
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ──────────────────────────────────────────
//  DATABASE CONNECTION
// ──────────────────────────────────────────

// เชื่อม MongoDB Atlas หรือ local MongoDB
// ถ้าไม่มี MongoDB ใช้ MONGODB_URI=mongodb://localhost:27017/zynky ใน .env
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zynky')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// ──────────────────────────────────────────
//  ROUTES  (ลงทะเบียน endpoint ทั้งหมด)
// ──────────────────────────────────────────

// แต่ละ route file จัดการ path ของตัวเอง
// เช่น postRoutes มี GET /  → จะกลายเป็น GET /api/posts
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

// Health check — ใช้ตรวจว่า server ยังทำงานอยู่
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// ──────────────────────────────────────────
//  GLOBAL ERROR HANDLER
//  รับ error จาก controller ทุกตัวผ่าน next(err)
// ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('💥 Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ──────────────────────────────────────────
//  START SERVER
// ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ZYNKY Backend running at http://localhost:${PORT}`);
});
