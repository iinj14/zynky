// ============================================================
//  src/context/AppContext.jsx  — STATE MANAGEMENT
//
//  หน้าที่: เก็บ state ที่ทุก Component ต้องการ
//          (currentUser, posts, loading, error, notifications)
//
//  ลำดับการทำงาน:
//    AppContext.jsx (สร้าง state + fetch ข้อมูลเริ่มต้น)
//      → แจก state ผ่าน Context ไปยัง Component ทุกตัว
//      → Component เรียก useApp() เพื่อดึง state ที่ต้องการ
//
//  เปรียบเทียบกับ MOCK เดิม:
//    เดิม: posts มาจาก MOCK_POSTS (array ในไฟล์เดียวกัน)
//    ใหม่: posts มาจาก postService.getPosts() → Backend → MongoDB
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import postService from '../services/postService';
import userService from '../services/userService';

// 1. สร้าง Context object
const AppContext = createContext(null);

// 2. Custom hook สำหรับ Component เรียกใช้ context
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

// 3. Provider Component — ห่อหุ้ม App ทั้งหมดใน main.jsx
export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('search');
  const [currentUser, setCurrentUser] = useState(null);  // null = ยังไม่ login
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  // ── โหลด user จาก token เมื่อ app เริ่มต้น ──
  // ถ้ามี token ใน localStorage → ดึงข้อมูล user จาก backend
  useEffect(() => {
    const token = localStorage.getItem('zynky_token');
    if (token) {
      userService.getMe()
        .then(res => setCurrentUser(res.data.data))
        .catch(() => localStorage.removeItem('zynky_token')); // token หมดอายุ
    }
  }, []);

  // ── ดึงโพสต์จาก Backend ──
  // useCallback ป้องกันการสร้าง function ใหม่ทุก render
  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postService.getPosts(params);
      // res.data.data = array of posts จาก Backend
      setPosts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false); // ปิด loading ไม่ว่าจะสำเร็จหรือไม่
    }
  }, []);

  // ── Login function ──
  // เรียกจาก Component → บันทึก token + อัปเดต state
  const login = async (email, password) => {
    const res = await userService.login(email, password);
    const { token, data } = res.data;
    localStorage.setItem('zynky_token', token);
    setCurrentUser(data);
    return data;
  };

  // ── Logout function ──
  const logout = () => {
    localStorage.removeItem('zynky_token');
    setCurrentUser(null);
  };

  // ── Toggle like (อัปเดต UI ทันที ก่อน API ตอบกลับ) ──
  const handleLike = async (postId) => {
    // Optimistic update: อัปเดต UI ก่อนเพื่อความลื่นไหล
    setPosts(prev => prev.map(p =>
      p._id === postId
        ? { ...p, liked: !p.liked, likesCount: p.liked ? p.likesCount - 1 : p.likesCount + 1 }
        : p
    ));
    // ส่งไป Backend จริง
    await postService.toggleLike(postId);
  };

  // ส่ง state และ function ทั้งหมดให้ Component ลูกผ่าน Context
  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      currentUser, setCurrentUser,
      posts, setPosts,
      loading, error,
      fetchPosts,
      login, logout,
      handleLike,
      notifications, setNotifications,
      chatOpen, setChatOpen,
      selectedChat, setSelectedChat,
    }}>
      {children}
    </AppContext.Provider>
  );
};
