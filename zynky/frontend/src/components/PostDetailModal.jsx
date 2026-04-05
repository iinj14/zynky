// ============================================================
//  src/components/PostDetailModal.jsx  — VIEW (Modal Component)
//
//  หน้าที่: แสดงรายละเอียดโพสต์แบบ popup modal
//  Props: post (object), onClose (function)
//  ใครเรียกใช้: SearchPage
// ============================================================

import StarRating from './StarRating';

const PostDetailModal = ({ post, onClose }) => {
  if (!post) return null;

  // ดึงข้อมูล author (รองรับทั้ง populated object และ mock data เดิม)
  const author = post.author || {};
  const name = author.name || post.reviewerName;
  const avatar = author.avatar || post.avatar;
  const rating = author.rating || post.rating || 0;
  const reviews = author.reviewCount || post.reviews || 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-teal-500/30 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-teal-300">Deal Details : {post.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <i className="fas fa-times text-xl" />
          </button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{avatar}</span>
          <div>
            <p className="font-bold">{name}</p>
            <StarRating rating={rating} size="md" />
            <p className="text-gray-400 text-xs">{reviews} รีวิว</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-2 text-sm">
          {[
            ['ชื่อบริการ', post.title],
            ['เวลา', post.time],
            ['ราคา', `฿${post.price?.toLocaleString()} ${post.priceType}`],
            ['วันที่ว่าง', post.available],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-400">{label}</span>
              <span className={label === 'ราคา' ? 'text-yellow-400 font-bold' : 'text-white'}>{val}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
          <p className="text-yellow-300 text-xs font-semibold mb-1">รายละเอียด</p>
          <p className="text-gray-300 text-sm">{post.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map(t => (
            <span key={t} className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded-full">{t}</span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 bg-teal-500 hover:bg-teal-400 text-white py-3 rounded-xl font-bold transition-all">
            <i className="fas fa-comment mr-2" />ติดต่อเดี๋ยวนี้
          </button>
          <button className="px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-colors">
            <i className="fas fa-share-alt" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
