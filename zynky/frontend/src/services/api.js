// ============================================================
//  src/services/api.js  — SERVICE layer (Frontend)
//
//  หน้าที่: สร้าง axios instance กลาง 1 ตัว
//          - กำหนด baseURL → ชี้ไป backend
//          - แนบ JWT token อัตโนมัติทุก request (interceptor)
//          - จัดการ error 401 (token หมดอายุ) อัตโนมัติ
//
//  ใครเรียกใช้: postService.js, userService.js
//  ทำงานกับ: backend/server.js → routes → controllers
// ============================================================

import axios from 'axios';

// สร้าง axios instance ที่มี config พื้นฐาน
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // หมดเวลาใน 10 วินาที
  headers: {
    'Content-Type': 'application/json',
  },
});

// ──────────────────────────────────────────
//  REQUEST INTERCEPTOR
//  ทำงานทุกครั้งก่อน request ออกไป Backend
//  → แนบ token จาก localStorage เข้า header อัตโนมัติ
// ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zynky_token');
    if (token) {
      // Backend ใช้ authMiddleware.js ตรวจ header นี้
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────
//  RESPONSE INTERCEPTOR
//  ทำงานทุกครั้งหลังได้รับ response
//  → ถ้า 401 (token หมด) → ล้าง token → redirect login
// ──────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zynky_token');
      // redirect ไปหน้า login (ถ้ามี react-router)
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
