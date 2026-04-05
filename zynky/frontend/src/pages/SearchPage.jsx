// ============================================================
//  src/pages/SearchPage.jsx  — VIEW (Page Component)
//
//  หน้าที่: หน้าค้นหา + แสดงโพสต์ทั้งหมด
//
//  ลำดับการทำงาน (Data Flow):
//    1. SearchPage mount → usePostList() hook ทำงาน
//    2. usePostList → useEffect → AppContext.fetchPosts()
//    3. fetchPosts → postService.getPosts() → axios GET /api/posts
//    4. Backend ตอบ JSON → setPosts(data) → loading=false
//    5. SearchPage re-render → แสดง PostCard แต่ละชิ้น
//    6. User กด filter/search → usePostList ส่ง params ใหม่ → วนซ้ำ
// ============================================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { usePostList, useCreatePost } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import CreatePostModal from '../components/CreatePostModal';
import SkeletonCard from '../components/SkeletonCard';
import userService from '../services/userService';

const CATEGORIES = ['ทั้งหมด', 'ท่องเที่ยว', 'ถ่ายภาพ', 'อาหาร', 'ฟิตเนส', 'ความบันเทิง', 'สุขภาพ'];
const CAT_MAP = {
  'ทั้งหมด': '', 'ท่องเที่ยว': 'travel', 'ถ่ายภาพ': 'photography',
  'อาหาร': 'cooking', 'ฟิตเนส': 'fitness', 'ความบันเทิง': 'entertainment', 'สุขภาพ': 'wellness',
};

const SearchPage = () => {
  const { currentUser, handleLike } = useApp();

  // Custom hook จัดการ fetch + filter (แยก logic ออกจาก UI)
  const { posts, loading, error, handleSearch, handleCategoryChange, category } = usePostList();
  const { createPost } = useCreatePost();

  // Local state สำหรับ UI เท่านั้น (ไม่เกี่ยวกับ data)
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Toggle save — เรียก API แล้วอัปเดต local state
  const handleSave = async (postId) => {
    if (!currentUser) return alert('กรุณาเข้าสู่ระบบก่อน');
    await userService.toggleSave(postId);
    // TODO: อัปเดต saved state ใน posts array (ทำ optimistic update แบบเดียวกับ like)
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-[pageIn_0.4s_ease]">

      {/* ── Search bar ── */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(searchInput)}
            placeholder="ค้นหา deal หรือ service..."
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-white
                       placeholder-gray-500 focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>
        <button
          onClick={() => handleSearch(searchInput)}
          className="bg-teal-500 hover:bg-teal-400 text-white px-5 py-3 rounded-2xl font-medium transition-colors"
        >
          ค้นหา
        </button>
        {currentUser && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-5 py-3 rounded-2xl transition-colors"
          >
            <i className="fas fa-plus" />
          </button>
        )}
      </div>

      {/* ── Category filter ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${(CAT_MAP[cat] || '') === category
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-2xl p-4 mb-6 text-center">
          <i className="fas fa-exclamation-triangle mr-2" />{error}
        </div>
      )}

      {/* ── Post grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : posts.length === 0
            ? (
              <div className="col-span-3 text-center py-20 text-gray-500">
                <i className="fas fa-search text-5xl mb-4 block text-gray-700" />
                ไม่พบผลลัพธ์ที่ค้นหา
              </div>
            )
            : posts.map(post => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onLike={handleLike}     // → AppContext.handleLike → toggleLike API
                onSave={handleSave}     // → userService.toggleSave → API
                onView={setSelectedPost} // → เปิด modal
              />
            ))}
      </div>

      {/* ── Modals ── */}
      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onSubmit={createPost}  // → useCreatePost → postService.createPost → POST /api/posts
        />
      )}
    </div>
  );
};

export default SearchPage;
