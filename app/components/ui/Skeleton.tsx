interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
  );
}


// 電影卡片骨架
export function SkeletonMovieCard() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <Skeleton className="h-96 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

interface SkeletonMovieListProps {
  count?: number;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function SkeletonMovieList({ 
  count = 12,
  columns = { sm: 1, md: 3, lg: 4 }
}: SkeletonMovieListProps) {
  const gridCols = `grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`;
  
  return (
    <div className={`grid ${gridCols} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMovieCard key={i} />
      ))}
    </div>
  );
}
// 座位選擇頁面骨架
export function SkeletonSeatSelection() {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <Skeleton className="h-8 w-48 mb-6" />  {/* 標題 */}
      
      {/* 銀幕 */}
      <Skeleton className="h-16 w-full mb-8" />
      
      {/* 座位 */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-2 justify-center">
            {[...Array(10)].map((_, j) => (
              <Skeleton key={j} className="h-11 w-11 rounded-t-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 訂票資訊骨架
export function SkeletonBookingInfo() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <Skeleton className="h-8 w-32 mb-4" />      {/* 標題 */}
      <Skeleton className="h-20 w-full" />        {/* 已選座位 */}
      <Skeleton className="h-12 w-full" />        {/* 總金額 */}
      <Skeleton className="h-12 w-full" />        {/* 姓名 */}
      <Skeleton className="h-12 w-full" />        {/* Email */}
      <Skeleton className="h-14 w-full mt-6" />   {/* 按鈕 */}
    </div>
  );
}