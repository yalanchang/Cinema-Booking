'use client';

import Link from 'next/link';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_url: string;
    duration: number;
    genre: string;
    rating: string;
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden
        border border-gray-800
        transition-all duration-500
        hover:border-[#D26900]
        group-hover:scale-105
        hover:shadow-[0_0_30px_rgba(210,105,0,0.1)]">

        {/* 海報 */}
        <Link href={`/movies/${movie.id}`}>
          <div className="relative h-96 bg-black overflow-hidden">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover
                transition-all duration-700
                group-hover:brightness-110"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/300x450/1f2937/ffffff?text=' + encodeURIComponent(movie.title);
              }}
            />

            {/* 評級標籤 */}
            <div className="absolute top-4 right-4
              bg-black/40 backdrop-blur-md
              text-white px-3 py-1.5 text-xs font-medium
              border border-white/10
              transition-all duration-300
              group-hover:border-[#D26900]
              group-hover:bg-[#D26900]/90">
              {movie.rating}
            </div>

            {/* 底部漸變 + 時長 */}
            <div className="absolute bottom-0 left-0 right-0
              bg-gradient-to-t from-black via-black/80 to-transparent
              p-6
              opacity-0 group-hover:opacity-100
              transition-opacity duration-500">

              <div className="flex items-center gap-2 text-white text-sm 
                transform translate-y-2 group-hover:translate-y-0
                transition-transform duration-500 delay-100">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{movie.duration} 分鐘</span>
              </div>
            </div>
          </div>
        </Link>

        {/* 資訊區 */}
        <div className="p-5 bg-neutral-900">
          <Link href={`/movies/${movie.id}`}>
            <h3 className="text-lg font-medium text-white mb-4
              transition-colors duration-300
              group-hover:text-[#D26900]">
              {movie.title}
            </h3>
          </Link>

          {/* 類型 */}
          <p className="text-sm text-gray-500 mb-8">
            {movie.genre.split('/').map((g, i, arr) => (
              <span key={i}>
                <span className="transition-colors duration-300 group-hover:text-gray-400">
                  {g.trim()}
                </span>
                {i < arr.length - 1 && <span className="mx-2">•</span>}
              </span>
            ))}
          </p>

          {/* 按鈕組 */}
          <div className="flex gap-2
            opacity-0 group-hover:opacity-100
            transform translate-y-2 group-hover:translate-y-0
            transition-all duration-500">

            <Link
              href={`/movies/${movie.id}`}
              className="flex-1 text-center
                border border-gray-700 hover:border-[#D26900]
                text-gray-400 hover:text-[#D26900]
                py-2.5 
                font-medium text-sm
                transition-all duration-300">
              詳情
            </Link>

            <Link
              href={`/movies/${movie.id}#showtimes`}
              className="flex-1 text-center
                bg-[#D26900] hover:bg-[#B85700]
                text-white py-2.5 
                font-medium text-sm
                transition-all duration-300
                hover:shadow-[0_0_20px_rgba(210,105,0,0.3)]">
              訂票
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}