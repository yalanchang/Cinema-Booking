'use client';

import MovieCard from './MovieCard';

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  duration: number;
  genre: string;
  rating: string;
}

interface MovieGridProps {
  movies: Movie[];
  emptyMessage?: string;
  onShowAll?: () => void;
}

export default function MovieGrid({ 
  movies, 
  emptyMessage = '沒有符合條件的電影',
  onShowAll 
}: MovieGridProps) {
  
  if (movies.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        <p className="text-xl mb-2">{emptyMessage}</p>
        <p className="text-sm mt-2">試試調整篩選條件或選擇其他日期</p>
        {onShowAll && (
          <button
            onClick={onShowAll}
            className="mt-6 bg-primary text-white px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-secondary"
          >
            顯示全部電影
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}