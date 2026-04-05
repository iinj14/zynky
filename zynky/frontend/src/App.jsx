// ============================================================
//  src/App.jsx  — ROOT COMPONENT
//
//  หน้าที่: จัด layout และ routing ระดับบนสุด
//          อ่าน currentPage จาก Context → แสดง Page ที่ถูกต้อง
//
//  หมายเหตุ: ใช้ state-based routing แทน React Router
//            เพื่อความเรียบง่าย (เปลี่ยนเป็น react-router-dom ได้)
// ============================================================

import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ChatPanel from './components/ChatPanel';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  const { currentPage } = useApp();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar อยู่ทุกหน้า — ดึง state จาก Context */}
      <Navbar />

      {/* Page content — เปลี่ยนตาม currentPage */}
      <main>
        {currentPage === 'search' && <SearchPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>

      {/* ChatPanel overlay — ซ้อนอยู่บนทุกหน้า */}
      <ChatPanel />
    </div>
  );
};

export default App;
