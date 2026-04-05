// ============================================================
//  src/components/Navbar.jsx  — VIEW (Component)
//
//  หน้าที่: แสดง navigation bar ด้านบน
//  รับ state จาก: AppContext (ผ่าน useApp hook)
//  ส่ง event ไปยัง: AppContext (setCurrentPage, setChatOpen)
// ============================================================

import { useApp } from '../context/AppContext';

const Navbar = () => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    notifications,
    setNotifications,
    setChatOpen,
  } = useApp(); // ดึง state และ function จาก Context

  return (
    <nav className="bg-gray-900 border-b border-teal-500/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🐝</span>
          <span className="text-2xl font-bold text-teal-400 tracking-wider">ZYNKY</span>
        </div>

        {/* Nav items */}
        <div className="flex items-center gap-2 md:gap-6">
          <button
            onClick={() => setCurrentPage('search')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${currentPage === 'search'
                ? 'bg-teal-500/20 text-teal-400'
                : 'text-gray-400 hover:text-white'}`}
          >
            <i className="fas fa-search mr-1" />
            <span className="hidden md:inline">ค้นหา</span>
          </button>

          <button
            onClick={() => setCurrentPage('profile')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${currentPage === 'profile'
                ? 'bg-teal-500/20 text-teal-400'
                : 'text-gray-400 hover:text-white'}`}
          >
            <i className="fas fa-user mr-1" />
            <span className="hidden md:inline">โปรไฟล์</span>
          </button>

          {/* Chat button + badge */}
          <button
            onClick={() => { setChatOpen(true); setNotifications(0); }}
            className="relative p-2 text-gray-400 hover:text-teal-400 transition-colors"
          >
            <i className="fas fa-comment-dots text-xl" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* User avatar */}
          {currentUser ? (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setCurrentPage('profile')}
            >
              <span className="text-2xl">{currentUser.avatar}</span>
              <span className="hidden md:block text-sm font-medium text-gray-300">
                {currentUser.name}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="bg-teal-500 hover:bg-teal-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
