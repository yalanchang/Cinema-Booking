'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Showtime {
  id: number;
  movie_id: number;
  theater_id: number;
  show_date: string;
  show_time: string;
  price: number;
  available_seats: number;
  theater_name: string;
  movie_title: string;
  duration: number;
  genre: string;
  rating: string;
}

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  genre: string;
  rating: string;
  poster_url: string;
  release_date: string;
  trailer_url?: string;
}

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id;
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchMovieAndShowtimes();
    }
  }, [movieId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTrailerOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchMovieAndShowtimes = async () => {
    try {
      setLoading(true);

      const movieResponse = await fetch(`/api/movies/${movieId}`);
      const movieResult = await movieResponse.json();
      
      if (movieResult.success) {
        setMovie(movieResult.data);
      }

      const showtimesResponse = await fetch(`/api/showtimes?movieId=${movieId}`);
      const showtimesResult = await showtimesResponse.json();
      
      if (showtimesResult.success) {
        setShowtimes(showtimesResult.data);
        
        if (showtimesResult.data.length > 0) {
          const firstDate = showtimesResult.data[0].show_date.split('T')[0];
          setSelectedDate(firstDate);
        }
        
        setError(null);
      } else {
        setError(showtimesResult.error || '無法載入場次資訊');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('網路連線錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTrailerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // 清理效果
    return () => {
      document.body.style.overflow = '';
    };
  }, [isTrailerOpen]);

  // 從 YouTube URL 提取 video ID
  const getVideoId = (url: string) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const getAvailableDates = () => {
    const dates = new Set<string>();
    showtimes.forEach(showtime => {
      const date = showtime.show_date.split('T')[0];
      dates.add(date);
    });
    return Array.from(dates).sort();
  };

  const getShowtimesByDate = () => {
    if (!selectedDate) return [];
    return showtimes
      .filter(showtime => showtime.show_date.split('T')[0] === selectedDate)
      .sort((a, b) => a.show_time.localeCompare(b.show_time));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const date = new Date(parseInt(parts[0]), month - 1, day);
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `${month}/${day} (${days[date.getDay()]})`;
  };

  const formatFullDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const date = new Date(year, month - 1, day);
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `${year}/${month}/${day} 星期${days[date.getDay()]}`;
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const checkDate = new Date(dateString);
    return checkDate.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D26900] mb-4"></div>
          <div className="text-white text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  const availableDates = getAvailableDates();
  const filteredShowtimes = getShowtimesByDate();
  const movieTitle = movie?.title || (showtimes.length > 0 ? showtimes[0].movie_title : '電影');
  const videoId = movie?.trailer_url ? getVideoId(movie.trailer_url) : null;

  return (
    <div className="min-h-screen bg-neutral-950">


      {/* 電影資訊區 */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-[400px,1fr] gap-8">
            
            {/* 左側：電影海報 */}
            <div className="relative">
              <div 
                onClick={() => videoId && setIsTrailerOpen(true)}
                className={`relative rounded-lg overflow-hidden shadow-2xl ${videoId ? 'cursor-pointer group' : ''}`}
              >
                <img 
                  src={movie?.poster_url || 'https://via.placeholder.com/400x600'}
                  alt={movieTitle}
                  className="w-full h-auto transition-transform duration-300 "
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x600/1f2937/ffffff?text=' + encodeURIComponent(movieTitle);
                  }}
                />
                
                {videoId && (
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                    <div className="rounded-full p-6 transform scale-100 group-hover:scale-110 transition-transform shadow-2xl mb-4">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-white">
              <h1 className="text-4xl font-bold mb-4">{movieTitle}</h1>
              
              {movie && (
                <>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="bg-[#D26900] px-4 py-1.5 rounded-full text-sm font-medium">
                      {movie.rating}
                    </span>
                    {movie.genre.split('/').map((g, i) => (
                      <span key={i} className="bg-neutral-800 px-4 py-1.5 rounded-full text-sm">
                        {g.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6 text-gray-300">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-24">片長</span>
                      <span>{movie.duration} 分鐘</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-24">上映日期</span>
                      <span>{movie.release_date}</span>
                    </div>
                  </div>

                  {/* 觀看預告片按鈕（手機版） */}
                  {videoId && (
                    <button
                      onClick={() => setIsTrailerOpen(true)}
                      className="md:hidden w-full mb-6 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-lg"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  )}

                  {movie.description && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3">劇情簡介</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {movie.description}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 場次選擇區 */}
      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-red-500 text-xl mb-4">❌ {error}</div>
            <button
              onClick={fetchMovieAndShowtimes}
              className="bg-[#D26900] hover:bg-[#B85800] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              重新載入
            </button>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-xl mb-2">此電影暫無可用場次</p>
            <p className="text-sm mb-6">請稍後再來查看或選擇其他電影</p>
            <Link
              href="/"
              className="inline-block bg-[#D26900] hover:bg-[#B85800] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              瀏覽其他電影
            </Link>
          </div>
        ) : (
          <>
            {/* 日期選擇器 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">選擇日期</h2>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedDate === date
                        ? 'bg-[#D26900] text-white shadow-lg shadow-[#D26900]/50'
                        : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                    }`}
                  >
                    {formatDate(date)}
                    {isToday(date) && (
                      <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        今天
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 場次列表 */}
            {selectedDate && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {formatFullDate(selectedDate)} 場次
                  </h2>
                  <span className="text-gray-400 text-sm">
                    共 {filteredShowtimes.length} 個場次
                  </span>
                </div>

                {filteredShowtimes.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 bg-neutral-900 rounded-lg">
                    <p className="text-lg">此日期暫無場次</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredShowtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        onClick={() => router.push(`/booking/${showtime.id}`)}
                        disabled={showtime.available_seats === 0}
                        className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                          showtime.available_seats === 0
                            ? 'bg-neutral-900 border-neutral-800 text-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-neutral-900 border-neutral-800 hover:border-[#D26900] hover:bg-neutral-800 hover:shadow-xl hover:shadow-[#D26900]/20 hover:scale-105 text-white cursor-pointer'
                        }`}
                      >
                        <div className="text-3xl font-bold mb-3 text-center">
                          {formatTime(showtime.show_time)}
                        </div>
                        <div className="text-sm text-gray-400 mb-3 text-center border-t border-neutral-800 pt-3">
                          {showtime.theater_name}
                        </div>
                        <div className="text-[#D26900] font-bold text-xl mb-3 text-center">
                          ${showtime.price}
                        </div>
                        <div className={`text-xs text-center py-1.5 rounded-full ${
                          showtime.available_seats === 0 
                            ? 'bg-gray-800 text-gray-600' 
                            : showtime.available_seats < 10
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {showtime.available_seats === 0 
                            ? '已售完'
                            : showtime.available_seats < 10
                            ? `僅剩 ${showtime.available_seats} 席`
                            : `剩餘 ${showtime.available_seats} 席`
                          }
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {isTrailerOpen && videoId && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-80 animate-fadeIn"
          onClick={() => setIsTrailerOpen(false)}
        >
          <div 
            className="relative w-full max-w-6xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 關閉按鈕 */}
            <button
              onClick={() => setIsTrailerOpen(false)}
              className="absolute -top-14 right-0 text-white hover:text-red-500 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="rounded-full transition-colors cursor-pointer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </button>

            <div className="relative pt-[56.25%] bg-black  overflow-hidden shadow-2xl">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${movieTitle} - 預告片`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}