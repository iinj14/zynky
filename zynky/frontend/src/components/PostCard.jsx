// ============================================================
//  src/components/PostCard.jsx  — VIEW (Component)
//
//  หน้าที่: แสดงการ์ดโพสต์แต่ละชิ้น
//  Props รับจาก: SearchPage (ส่ง post object มาให้)
//  Emits: onLike, onSave, onView → SearchPage จัดการต่อ
// ============================================================

import StarRating from './StarRating';

const PostCard = ({ post, onLike, onSave, onView }) => {
  return (
    <div
      className="bg-gray-800/80 backdrop-blur rounded-2xl p-4 border border-gray-700/50
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                 hover:shadow-teal-500/10 cursor-pointer"
      onClick={() => onView(post)}
    >
      {/* Badge */}
      {post.badge && (
        <div className={`${post.badgeColor} text-white text-xs px-2 py-1 rounded-full
                         inline-block mb-2 font-semibold animate-pulse`}>
          🔥 {post.badge}
        </div>
      )}

      {/* Author info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{post.author?.avatar || post.avatar}</span>
          <div>
            <p className="font-semibold text-white text-sm">{post.author?.name || post.reviewerName}</p>
            <StarRating rating={post.author?.rating || post.rating || 0} />
          </div>
        </div>
        {/* Save button */}
        <button
          onClick={e => { e.stopPropagation(); onSave(post._id || post.id); }}
          className={`text-lg transition-colors
            ${post.saved ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
        >
          <i className={`${post.saved ? 'fas' : 'far'} fa-bookmark`} />
        </button>
      </div>

      {/* Content */}
      <h3 className="font-bold text-teal-300 text-base mb-1">{post.title}</h3>
      <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{post.description}</p>

      {/* Schedule */}
      <div className="bg-gray-900/50 rounded-xl p-2 mb-3 text-xs text-gray-400">
        <div className="flex justify-between">
          <span><i className="fas fa-calendar-alt mr-1 text-teal-400" />{post.available}</span>
          <span><i className="fas fa-clock mr-1 text-teal-400" />{post.time}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {post.tags?.map(t => (
          <span key={t} className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">
            {t}
          </span>
        ))}
      </div>

      {/* Price + Like */}
      <div className="flex items-center justify-between">
        <div className="text-yellow-400 font-bold">
          ฿{post.price?.toLocaleString()}{' '}
          <span className="text-gray-500 text-xs font-normal">{post.priceType}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); onLike(post._id || post.id); }}
            className={`flex items-center gap-1 text-sm transition-colors
              ${post.liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}
          >
            <i className={`${post.liked ? 'fas' : 'far'} fa-heart`} />
            <span className="text-xs">{post.likesCount || post.likes || 0}</span>
          </button>
          <button className="bg-teal-500 hover:bg-teal-400 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
            ติดต่อ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
