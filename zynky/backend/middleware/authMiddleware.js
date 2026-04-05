// ============================================================
//  middleware/authMiddleware.js
//
//  หน้าที่: ตรวจสอบ JWT Token ก่อน request ถึง Controller
//
//  ลำดับการทำงาน:
//    Frontend ส่ง Header: { Authorization: "Bearer <token>" }
//      → authMiddleware decode token → แนบ req.user
//      → ถ้า token ไม่ถูกต้อง → ตอบ 401 ทันที (Controller ไม่ถูกเรียก)
//      → ถ้าถูกต้อง → next() → Controller ทำงานต่อ
//
//  ใช้กับ route ที่ต้อง login เช่น:
//    router.post('/', protect, PostController.createPost)
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // 1. ดึง token จาก Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer abc123" → "abc123"

    // 2. Verify token (ถ้า token หมดอายุหรือถูกแก้ไข จะ throw error)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zynky_secret');

    // 3. ตรวจว่า user ยังมีอยู่ในระบบ (กรณีถูกลบบัญชี)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });
    }

    // 4. แนบ user เข้า request → Controller จะเรียกใช้ req.user.id ได้
    req.user = user;
    next(); // ส่งต่อไป Controller

  } catch (err) {
    // token หมดอายุ หรือ invalid
    return res.status(401).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

module.exports = { protect };
