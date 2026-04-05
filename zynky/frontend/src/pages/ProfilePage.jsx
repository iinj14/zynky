// ============================================================
//  src/pages/ProfilePage.jsx  — VIEW (Page Component)
//
//  หน้าที่: หน้าโปรไฟล์ผู้ใช้
//  Tabs: โพสต์ของฉัน | บันทึกไว้ | ตาราง | รายได้
//
//  ลำดับการทำงาน:
//    ProfilePage mount → useEffect → GET /api/users/me
//    → ดึงโพสต์ของตัวเอง → GET /api/posts?author=userId
//    User แก้ไขโปรไฟล์ → PUT /api/users/me
//    User ลบโพสต์ → DELETE /api/posts/:id
// ============================================================

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import postService from '../services/postService';
import userService from '../services/userService';
import StarRating from '../components/StarRating';

const TABS = [
  { id: 'posts', label: 'โพสต์ของฉัน', icon: 'fa-th-large' },
  { id: 'saved', label: 'บันทึกไว้', icon: 'fa-bookmark' },
  { id: 'calendar', label: 'ตาราง', icon: 'fa-calendar-alt' },
  { id: 'earnings', label: 'รายได้', icon: 'fa-chart-bar' },
];

const ProfilePage = () => {
  const { currentUser, setCurrentUser, logout } = useApp();
  const [activeTab, setActiveTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // ── โหลดโพสต์ของตัวเอง ──
  useEffect(() => {
    if (!currentUser) return;
    setLoadingPosts(true);
    // ดึงเฉพาะโพสต์ของ currentUser — Backend filter ตาม token
    postService.getPosts({ author: currentUser.id })
      .then(res => setMyPosts(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
  }, [currentUser]);

  // ── โหลด saved posts จาก user profile ──
  useEffect(() => {
    if (!currentUser) return;
    userService.getMe()
      .then(res => setSavedPosts(res.data.data?.savedPosts || []))
      .catch(() => {});
  }, [currentUser]);

  // ── เริ่ม edit mode ──
  const startEdit = () => {
    setEditForm({ name: currentUser.name, bio: currentUser.bio });
    setEditMode(true);
  };

  // ── บันทึกโปรไฟล์ → PUT /api/users/me ──
  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await userService.updateMe(editForm);
      setCurrentUser(prev => ({ ...prev, ...res.data.data }));
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  // ── ลบโพสต์ → DELETE /api/posts/:id ──
  const handleDelete = async (id) => {
    await postService.deletePost(id);
    setMyPosts(prev => prev.filter(p => (p._id || p.id) !== id));
    setShowDeleteConfirm(null);
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <i className="fas fa-user-lock text-6xl text-gray-700 mb-4 block" />
        <p className="text-gray-400 mb-4">กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-[pageIn_0.4s_ease]">

      {/* ── Profile Header ── */}
      <div className="bg-gray-800/60 backdrop-blur rounded-2xl p-6 mb-6 border border-gray-700/50">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-5xl shadow-lg shadow-teal-500/30">
              {currentUser.avatar}
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-teal-400 rounded-full border-2 border-gray-800" />
          </div>

          {/* Info / Edit form */}
          <div className="flex-1">
            {editMode ? (
              <div className="space-y-3">
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="bg-gray-700 border border-teal-400 rounded-lg px-3 py-1.5 text-white font-bold text-xl focus:outline-none w-full md:w-auto"
                />
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-gray-300 text-sm focus:outline-none w-full"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? <><i className="fas fa-spinner fa-spin mr-1" />บันทึก...</> : '✓ บันทึก'}
                  </button>
                  <button onClick={() => setEditMode(false)} className="bg-gray-700 text-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-600">
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                  <span className="text-gray-400 text-sm">{currentUser.username}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{currentUser.bio}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-teal-300 font-bold">
                    {currentUser.followersCount || 0}{' '}
                    <span className="text-gray-400 font-normal text-sm">ผู้ติดตาม</span>
                  </span>
                  <StarRating rating={currentUser.rating || 0} size="md" />
                  <span className="text-gray-400 text-sm">{currentUser.reviewCount || 0} รีวิว</span>
                </div>
              </>
            )}
          </div>

          {/* Edit + Logout buttons */}
          {!editMode && (
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
              >
                <i className="fas fa-pen" /> แก้ไข
              </button>
              <button
                onClick={logout}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-xl text-sm"
              >
                <i className="fas fa-sign-out-alt" />
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-700">
          {[
            ['โพสต์', 'fa-th-large', `${myPosts.length} รายการ`, 'text-teal-400'],
            ['รีวิว', 'fa-star', `${currentUser.reviewCount || 0} รีวิว`, 'text-yellow-400'],
            ['บันทึก', 'fa-bookmark', `${savedPosts.length} รายการ`, 'text-purple-400'],
          ].map(([label, icon, val, color]) => (
            <div key={label} className="bg-gray-900/50 rounded-xl p-3 text-center">
              <i className={`fas ${icon} ${color} mb-1`} />
              <p className={`font-bold ${color}`}>{val}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-0 mb-6 bg-gray-800/60 rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-gray-700 text-teal-400 shadow' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <i className={`fas ${tab.icon}`} />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: My Posts ── */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {loadingPosts ? (
            <div className="text-center py-10 text-gray-500">
              <i className="fas fa-spinner fa-spin mr-2" />โหลดโพสต์...
            </div>
          ) : myPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <i className="fas fa-plus-circle text-5xl mb-4 block text-gray-700" />
              <p>ยังไม่มีโพสต์ ไปสร้างโพสต์แรกของคุณเลย!</p>
            </div>
          ) : myPosts.map(post => (
            <div key={post._id || post.id} className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 hover:-translate-y-1 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-teal-300 mb-1">{post.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{post.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags?.map(t => (
                      <span key={t} className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-yellow-400 font-bold">฿{post.price?.toLocaleString()} <span className="text-gray-500 font-normal text-xs">{post.priceType}</span></span>
                    <span className="text-gray-500"><i className="fas fa-heart text-red-400 mr-1" />{post.likesCount || 0}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-3">
                  <button className="text-gray-400 hover:text-teal-400 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <i className="fas fa-edit" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(post._id || post.id)}
                    className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>

              {/* Delete confirm */}
              {showDeleteConfirm === (post._id || post.id) && (
                <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                  <p className="text-red-400 text-sm"><i className="fas fa-exclamation-triangle mr-1" />ยืนยันลบโพสต์นี้?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(null)} className="text-xs px-3 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600">ยกเลิก</button>
                    <button onClick={() => handleDelete(post._id || post.id)} className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg">ลบ</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Saved ── */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPosts.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-gray-500">
              <i className="fas fa-bookmark text-5xl mb-4 block text-gray-700" />
              <p>ยังไม่มีรายการที่บันทึก</p>
            </div>
          ) : savedPosts.map(post => (
            <div key={post._id} className="bg-gray-800/60 rounded-2xl p-4 border border-yellow-500/20">
              <h3 className="font-bold text-teal-300 text-sm mb-1">{post.title}</h3>
              <span className="text-yellow-400 font-bold text-sm">฿{post.price?.toLocaleString()} <span className="text-gray-500 font-normal text-xs">{post.priceType}</span></span>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Earnings ── */}
      {activeTab === 'earnings' && (
        <div className="bg-gray-800/60 rounded-2xl p-5 border border-gray-700/50">
          <div className="bg-yellow-500 text-gray-900 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">จำนวนเงินที่ได้รับ :</p>
              <p className="text-3xl font-bold">6,900.00 THB</p>
            </div>
            <i className="fas fa-wallet text-4xl opacity-30" />
          </div>
          <div className="flex items-end gap-1 h-32 mb-4">
            {[40, 65, 80, 55, 90, 70, 85, 60, 75, 95, 50, 88].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-teal-500 rounded-t-sm hover:bg-teal-400 transition-colors cursor-pointer" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20">
            <i className="fas fa-money-bill-wave mr-2" />ถอนเงิน
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
