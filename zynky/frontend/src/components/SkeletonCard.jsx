// ============================================================
//  src/components/SkeletonCard.jsx  — VIEW (Loading State)
//
//  หน้าที่: แสดง placeholder animation ระหว่าง loading
//  ใครเรียกใช้: SearchPage (แสดงเมื่อ loading === true)
// ============================================================

const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
    <div className="h-4 rounded w-3/4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700
                    bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    <div className="h-3 rounded w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700
                    bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    <div className="h-3 rounded w-5/6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700
                    bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    <div className="h-24 rounded-xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700
                    bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    <div className="h-4 rounded w-1/2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700
                    bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
  </div>
);

export default SkeletonCard;
