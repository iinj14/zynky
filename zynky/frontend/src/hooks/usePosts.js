// ============================================================
//  src/hooks/usePosts.js  — CUSTOM HOOK
//
//  หน้าที่: Logic การดึงและจัดการโพสต์
//          แยกออกมาจาก Component ให้ Component เบาลง
//
//  ลำดับการทำงาน:
//    SearchPage เรียก usePosts()
//    → usePosts เรียก AppContext.fetchPosts()
//    → fetchPosts เรียก postService.getPosts()
//    → postService ส่ง HTTP GET ไป Backend
//    → Backend ตอบ JSON → setPosts → Component re-render
// ============================================================

import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import postService from '../services/postService';

// ── usePostList: ดึงโพสต์พร้อม filter ──
export const usePostList = () => {
  const { posts, loading, error, fetchPosts } = useApp();
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // โหลดโพสต์ครั้งแรก หรือเมื่อ filter เปลี่ยน
  useEffect(() => {
    fetchPosts({ category, q: searchQuery });
  }, [category, searchQuery, fetchPosts]);

  const handleSearch = (q) => setSearchQuery(q);
  const handleCategoryChange = (cat) => setCategory(cat === 'ทั้งหมด' ? '' : cat);

  return { posts, loading, error, handleSearch, handleCategoryChange, category, searchQuery };
};

// ── usePost: ดึงโพสต์ตาม ID ──
export const usePost = (id) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    postService.getPostById(id)
      .then(res => setPost(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'เกิดข้อผิดพลาด'))
      .finally(() => setLoading(false));
  }, [id]);

  return { post, loading, error };
};

// ── useCreatePost: สร้างโพสต์ใหม่ ──
export const useCreatePost = () => {
  const { fetchPosts } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const createPost = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await postService.createPost(data);
      // รีเฟรชรายการโพสต์หลังสร้างสำเร็จ
      await fetchPosts();
      return true;
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'ไม่สามารถสร้างโพสต์ได้');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { createPost, submitting, submitError };
};
