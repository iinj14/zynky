// ============================================================
//  models/User.js  — MODEL layer
//
//  หน้าที่: กำหนดโครงสร้างข้อมูล User ใน MongoDB
//          รวม password hashing ก่อนบันทึก
//
//  ใครเรียกใช้: UserController.js, authMiddleware.js
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'กรุณาใส่ชื่อ'],
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,       // ห้ามซ้ำกัน
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'กรุณาใส่อีเมล'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,      // ไม่ส่ง password กลับไปใน query ปกติ (ปลอดภัย)
    },
    avatar: { type: String, default: '🧑' },
    bio: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// ──────────────────────────────────────────
//  PRE-SAVE HOOK — hash password ก่อนบันทึก
//  ทำงานอัตโนมัติเมื่อ user.save() ถูกเรียก
// ──────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // ถ้า password ไม่ได้ถูกแก้ไข ข้ามการ hash
  if (!this.isModified('password')) return next();
  // hash ด้วย salt rounds = 10
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ──────────────────────────────────────────
//  METHOD — ตรวจสอบ password
//  ใช้ใน UserController ตอน login
// ──────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual: จำนวน followers
userSchema.virtual('followersCount').get(function () {
  return this.followers.length;
});

module.exports = mongoose.model('User', userSchema);
