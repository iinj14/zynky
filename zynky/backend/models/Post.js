// ============================================================
//  models/Post.js  — MODEL layer
//
//  หน้าที่: กำหนดโครงสร้างข้อมูล Post ใน MongoDB
//          พร้อม validation rules
//
//  ใครเรียกใช้: PostController.js
//  เก็บข้อมูลที่: MongoDB collection "posts"
// ============================================================

const mongoose = require('mongoose');

// กำหนด Schema (โครงสร้าง + validation ของแต่ละ field)
const postSchema = new mongoose.Schema(
  {
    // ──── ข้อมูลผู้โพสต์ ────
    author: {
      // อ้างอิงไปยัง User model (_id ของ User)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ──── เนื้อหาโพสต์ ────
    title: {
      type: String,
      required: [true, 'กรุณาใส่ชื่อบริการ'],
      trim: true,
      maxlength: [100, 'ชื่อบริการยาวเกินไป (สูงสุด 100 ตัวอักษร)'],
    },
    description: {
      type: String,
      required: [true, 'กรุณาใส่รายละเอียด'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'กรุณาใส่ราคา'],
      min: [0, 'ราคาต้องไม่ติดลบ'],
    },
    priceType: {
      type: String,
      default: 'ต่อคน',
    },
    category: {
      type: String,
      enum: ['travel', 'photography', 'cooking', 'fitness', 'entertainment', 'wellness', 'other'],
      default: 'other',
    },
    tags: [String], // array ของ tag เช่น ['ท่องเที่ยว', 'เชียงใหม่']

    // ──── วันเวลา ────
    available: String, // เช่น "Mon, Aug 17"
    time: String,      // เช่น "09:00 - 21:00"

    // ──── Engagement ────
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // เก็บ array ของ userId ที่กด like
    badge: { type: String, default: '' },
    badgeColor: { type: String, default: '' },
  },
  {
    // timestamps: true → mongoose จะสร้าง createdAt, updatedAt ให้อัตโนมัติ
    timestamps: true,
    // เพิ่ม virtual field 'id' (string) นอกจาก '_id' (ObjectId)
    toJSON: { virtuals: true },
  }
);

// ──────────────────────────────────────────
//  VIRTUAL FIELD — likesCount
//  คำนวณจาก likes array โดยไม่เก็บใน DB
// ──────────────────────────────────────────
postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

// ──────────────────────────────────────────
//  INDEX — ค้นหาเร็วขึ้น
// ──────────────────────────────────────────
postSchema.index({ category: 1 });        // filter by category
postSchema.index({ title: 'text', description: 'text' }); // full-text search

module.exports = mongoose.model('Post', postSchema);

// ══════════════════════════════════════════
//  การเชื่อมต่อ:
//  Post.js (Model)
//    ↑ ใช้โดย
//  PostController.js (Controller)
//    ↑ เรียกโดย
//  postRoutes.js (Router)
//    ↑ ลงทะเบียนใน
//  server.js
// ══════════════════════════════════════════
