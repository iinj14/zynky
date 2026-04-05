// ============================================================
//  src/components/ChatPanel.jsx  — VIEW (Slide-in Panel)
//
//  หน้าที่: แสดง chat panel ด้านขวา
//  รับ state จาก: AppContext (chatOpen, selectedChat)
//  เรียก API: GET /api/chats, POST /api/chats/:id/messages
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

const ChatPanel = () => {
  const { chatOpen, setChatOpen, selectedChat, setSelectedChat, currentUser } = useApp();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const messagesEndRef = useRef(null);

  // ── โหลดรายการ chat เมื่อ panel เปิด ──
  useEffect(() => {
    if (!chatOpen || !currentUser) return;
    setLoadingChats(true);
    api.get('/chats')
      .then(res => setChats(res.data.data))
      .catch(() => {})  // ถ้า backend ไม่พร้อม ไม่ crash
      .finally(() => setLoadingChats(false));
  }, [chatOpen, currentUser]);

  // ── โหลดข้อความเมื่อเลือก chat ──
  useEffect(() => {
    if (!selectedChat) return;
    api.get(`/chats/${selectedChat._id}/messages`)
      .then(res => setMessages(res.data.data))
      .catch(() => {});
  }, [selectedChat]);

  // ── scroll ลงล่างสุดอัตโนมัติ ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    const text = newMsg;
    setNewMsg('');
    try {
      const res = await api.post(`/chats/${selectedChat._id}/messages`, { text });
      setMessages(prev => [...prev, res.data.data]);
    } catch {
      setNewMsg(text); // คืน text ถ้าส่งไม่สำเร็จ
    }
  };

  if (!chatOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="flex-1" onClick={() => setChatOpen(false)} />

      {/* Panel */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
          {selectedChat ? (
            <>
              <button onClick={() => setSelectedChat(null)} className="text-gray-400 hover:text-white mr-2">
                <i className="fas fa-arrow-left" />
              </button>
              <span className="font-semibold text-white text-sm flex-1">
                {selectedChat.participants?.find(p => p._id !== currentUser?.id)?.name || 'Chat'}
              </span>
            </>
          ) : (
            <span className="font-bold text-teal-400">
              <i className="fas fa-comment-dots mr-2" />Messages
            </span>
          )}
          <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Chat list or messages */}
        <div className="flex-1 overflow-y-auto">
          {!selectedChat ? (
            // รายการ chats
            loadingChats ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <i className="fas fa-spinner fa-spin mr-2" />โหลด...
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <i className="fas fa-comment-slash text-4xl mb-3 block text-gray-700" />
                ยังไม่มีการสนทนา
              </div>
            ) : (
              chats.map(chat => {
                const other = chat.participants?.find(p => p._id !== currentUser?.id);
                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 transition-colors"
                  >
                    <span className="text-2xl">{other?.avatar || '👤'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{other?.name || 'User'}</p>
                      <p className="text-gray-400 text-xs truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // ข้อความใน chat
            <div className="p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.sender?._id === currentUser?.id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm
                      ${isMe
                        ? 'bg-teal-500 text-white rounded-br-sm'
                        : 'bg-gray-700 text-gray-100 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input box (แสดงเฉพาะเมื่อเลือก chat) */}
        {selectedChat && (
          <div className="px-3 py-3 border-t border-gray-700 flex gap-2">
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
            />
            <button
              onClick={sendMessage}
              className="bg-teal-500 hover:bg-teal-400 text-white px-3 py-2 rounded-xl transition-colors"
            >
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
