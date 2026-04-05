// ============================================================
//  controllers/PostController.js  — CONTROLLER layer
//
//  หน้าที่: รับ request จาก Router → เรียก Model → ส่ง response
//          เป็นตัวกลางระหว่าง Routes กับ Database
//
//  ลำดับการทำงานแต่ละ function:
//    Route รับ request → เรียก Controller function
//    → Controller คุยกับ Model (Post.js)
//    → Model query MongoDB
//    → Controller ส่ง JSON response กลับไป Frontend
// ============================================================

const Post = require('../models/Post');   // เรียกใช้ Model
const User = require('../models/User');

// ──────────────────────────────────────────
//  GET /api/posts
//  ดึงโพสต์ทั้งหมด (พร้อม filter + search)
//
//  Query params ที่รับได้:
//    ?category=travel   → กรองตาม category
//    ?q=เชียงใหม่        → full-text search
//    ?page=1&limit=10   → pagination
// ──────────────────────────────────────────
const getPosts = async (req, res, next) => {
  try {
    const { category, q, page = 1, limit = 10 } = req.query;

    // สร้าง query object ตาม filter ที่ส่งมา
    const query = {};
    if (category && category !== '') {
      query.category = category;
    }
    if (q) {
      // ใช้ MongoDB $text index ค้นหาตามชื่อ/รายละเอียด
      query.$text = { $search: q };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // .populate('author', 'name username avatar rating reviewCount')
    // → แทนที่ author ObjectId ด้วยข้อมูล User จริง
    const posts = await Post.find(query)
      .populate('author', 'name username avatar rating reviewCount')
      .sort({ createdAt: -1 })  // ล่าสุดก่อน
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err); // ส่งไปยัง global error handler ใน server.js
  }
};

// ──────────────────────────────────────────
//  GET /api/posts/:id
//  ดึงโพสต์ชิ้นเดียวตาม ID
// ──────────────────────────────────────────
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username avatar rating reviewCount bio');

    if (!post) {
      return res.status(404).json({ success: false, message: 'ไม่พบโพสต์นี้' });
    }

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/posts
//  สร้างโพสต์ใหม่
//
//  ต้องผ่าน authMiddleware ก่อน (มี req.user)
//  Body: { title, description, price, priceType, category, tags, available, time }
// ──────────────────────────────────────────
const createPost = async (req, res, next) => {
  try {
    const { title, description, price, priceType, category, tags, available, time } = req.body;

    // req.user.id มาจาก authMiddleware.js (decode JWT แล้วแนบ user ไว้)
    const post = await Post.create({
      author: req.user.id,
      title,
      description,
      price,
      priceType,
      category,
      tags,
      available,
      time,
    });

    // populate author ก่อนส่งกลับ เพื่อให้ Frontend ใช้ได้เลย
    await post.populate('author', 'name username avatar');

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  PUT /api/posts/:id
//  แก้ไขโพสต์ (เจ้าของเท่านั้น)
// ──────────────────────────────────────────
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'ไม่พบโพสต์' });

    // ตรวจสอบว่าเป็นเจ้าของจริง
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์แก้ไข' });
    }

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },       // อัปเดตเฉพาะ field ที่ส่งมา
      { new: true, runValidators: true }  // ส่ง document ใหม่กลับ + validate
    ).populate('author', 'name username avatar');

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  DELETE /api/posts/:id
//  ลบโพสต์ (เจ้าของเท่านั้น)
// ──────────────────────────────────────────
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'ไม่พบโพสต์' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ลบ' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'ลบโพสต์แล้ว' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/posts/:id/like
//  Toggle like (ถ้า like แล้ว → unlike, ถ้ายังไม่ like → like)
// ──────────────────────────────────────────
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'ไม่พบโพสต์' });

    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // ถอด userId ออกจาก likes array
      post.likes.pull(userId);
    } else {
      // เพิ่ม userId เข้า likes array
      post.likes.push(userId);
    }

    await post.save();
    res.json({ success: true, liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (err) {
    next(err);
  }
};

// export ทุก function เพื่อให้ postRoutes.js นำไปใช้
module.exports = { getPosts, getPostById, createPost, updatePost, deletePost, toggleLike };
