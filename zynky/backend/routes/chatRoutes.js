// ============================================================
//  routes/chatRoutes.js  — ROUTE layer
//  ลงทะเบียนใน server.js → /api/chats/...
// ============================================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// ── inline Mini-Model (เล็กพอไม่ต้องแยกไฟล์) ──
const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);
const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: String,
    lastTime: Date,
  },
  { timestamps: true }
);
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// GET /api/chats — ดึงรายการ chat ของตัวเอง
router.get('/', protect, async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name avatar username')
      .sort({ lastTime: -1 });
    res.json({ success: true, data: chats });
  } catch (err) { next(err); }
});

// GET /api/chats/:chatId/messages — ดึงข้อความใน chat
router.get('/:chatId/messages', protect, async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
});

// POST /api/chats/:chatId/messages — ส่งข้อความ
router.post('/:chatId/messages', protect, async (req, res, next) => {
  try {
    const msg = await Message.create({
      chat: req.params.chatId,
      sender: req.user.id,
      text: req.body.text,
    });
    // อัปเดต lastMessage ของ chat
    await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: req.body.text,
      lastTime: new Date(),
    });
    await msg.populate('sender', 'name avatar');
    res.status(201).json({ success: true, data: msg });
  } catch (err) { next(err); }
});

module.exports = router;
