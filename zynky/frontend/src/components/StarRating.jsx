// ============================================================
//  src/components/StarRating.jsx  — VIEW (Reusable Component)
//
//  หน้าที่: แสดงดาว rating
//  Props: rating (number), size ('sm' | 'md')
//  ใครเรียกใช้: PostCard, ProfilePage, PostDetailModal
// ============================================================

const StarRating = ({ rating = 0, size = 'sm' }) => {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <i
          key={i}
          className={`fas fa-star ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
        />
      ))}
      <span className="text-gray-400 ml-1">{Number(rating).toFixed(1)}</span>
    </div>
  );
};

export default StarRating;
