// ============================================================
//  controllers/UserController.js  — CONTROLLER layer
//
//  จัดการ: Register, Login, Get/Update Profile, Toggle Save Post
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── helper: สร้าง JWT token ──
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'zynky_secret', { expiresIn: '7d' });

// ──────────────────────────────────────────
//  POST /api/users/register
//  สมัครสมาชิก
//  Body: { name, username, email, password }
// ──────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    // ตรวจว่า email ซ้ำหรือไม่
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้แล้ว' });
    }

    // สร้าง User ใหม่ (password จะถูก hash อัตโนมัติใน User.pre('save'))
    const user = await User.create({ name, username, email, password });

    // ส่ง token กลับ → Frontend เก็บไว้ใน localStorage
    res.status(201).json({
      success: true,
      token: signToken(user._id),
      data: { id: user._id, name: user.name, username: user.username, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/users/login
//  เข้าสู่ระบบ
//  Body: { email, password }
// ──────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ดึง user + password (select: false ใน schema ต้องระบุ + เพิ่ม)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // เปรียบเทียบ password ด้วย method ที่กำหนดใน User.js
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    res.json({
      success: true,
      token: signToken(user._id),
      data: { id: user._id, name: user.name, username: user.username, avatar: user.avatar, bio: user.bio },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  GET /api/users/me
//  ดึงข้อมูลโปรไฟล์ตัวเอง (ต้อง login)
// ──────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedPosts', 'title price priceType');  // ดึงข้อมูลบันทึกไว้ด้วย

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  PUT /api/users/me
//  อัปเดตโปรไฟล์ตัวเอง
//  Body: { name, bio, avatar }
// ──────────────────────────────────────────
const updateMe = async (req, res, next) => {
  try {
    // ป้องกันการแก้ไข password ผ่าน endpoint นี้
    const { name, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/users/save/:postId
//  Toggle บันทึก / ยกเลิกบันทึกโพสต์
// ──────────────────────────────────────────
const toggleSavePost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.postId;
    const alreadySaved = user.savedPosts.includes(postId);

    if (alreadySaved) {
      user.savedPosts.pull(postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();
    res.json({ success: true, saved: !alreadySaved });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe, toggleSavePost };
