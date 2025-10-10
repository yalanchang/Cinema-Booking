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

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id;
  
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedShowtimes, setGroupedShowtimes] = useState<{[key: string]: Showtime[]}>({});

  useEffect(() => {
    if (movieId) {
      fetchShowtimes();
    }
  }, [movieId]);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/showtimes?movieId=${movieId}`);
      const result = await response.json();
      
      if (result.success) {
        setShowtimes(result.data);
        
        const grouped = result.data.reduce((acc: {[key: string]: Showtime[]}, showtime: Showtime) => {
          const date = showtime.show_date;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(showtime);
          return acc;
        }, {});
        
        setGroupedShowtimes(grouped);
        setError(null);
      } else {
        setError(result.error || '無法載入場次資訊');
      }
    } catch (err) {
      console.error('Error fetching showtimes:', err);
      setError('網路連線錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // 處理 YYYY-MM-DD 格式
    const parts = dateString.split('T')[0].split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    
    const date = new Date(year, month, day);
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    
    const displayMonth = date.getMonth() + 1;
    const displayDay = date.getDate();
    const weekday = days[date.getDay()];
    
    return `${displayMonth}月${displayDay}日 星期${weekday}`;
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };
  
  const isToday = (dateString: string) => {
    if (!dateString) return false;
    
    const parts = dateString.split('T')[0].split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    
    const date = new Date(year, month, day);
    const today = new Date();
    
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <div className="text-white text-xl">載入場次中...</div>
        </div>
      </div>
    );
  }

  const movieTitle = showtimes.length > 0 ? showtimes[0].movie_title : '電影';
  const movieInfo = showtimes.length > 0 ? showtimes[0] : null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-2xl">
        <div className="container mx-auto">
          <Link 
            href="/" 
            className="text-red-100 hover:text-white mb-3 inline-flex items-center gap-2 transition-colors"
          >
            ← 返回首頁
          </Link>
          <h1 className="text-4xl font-bold mb-2">{movieTitle}</h1>
          {movieInfo && (
            <div className="flex gap-4 text-red-100">
              <span>🎭 {movieInfo.genre}</span>
              <span>⏱️ {movieInfo.duration} 分鐘</span>
              <span>📋 {movieInfo.rating}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">🎫 選擇場次</h2>
          <p className="text-gray-400">點選場次進行訂票</p>
        </div>

        {error ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-red-500 text-xl mb-4">❌ {error}</div>
            <button
              onClick={fetchShowtimes}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              重新載入
            </button>
          </div>
        ) : Object.keys(groupedShowtimes).length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-xl mb-2">此電影暫無可用場次</p>
            <p className="text-sm mb-6">請稍後再來查看或選擇其他電影</p>
            <Link
              href="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              瀏覽其他電影
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedShowtimes).map(([date, times]) => (
              <div key={date} className="bg-gray-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-2xl font-bold text-white">
                    {formatDate(date)}
                  </h3>
                  {isToday(date) && (
                    <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      今天
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {times.map((showtime) => (
                    <button
                      key={showtime.id}
                      onClick={() => router.push(`/booking/${showtime.id}`)}
                      disabled={showtime.available_seats === 0}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        showtime.available_seats === 0
                          ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
                          : 'bg-gray-700 border-gray-600 hover:border-red-600 hover:bg-gray-600 hover:shadow-lg hover:scale-105 text-white'
                      }`}
                    >
                      <div className="text-2xl font-bold mb-2">
                        {formatTime(showtime.show_time)}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        {showtime.theater_name}
                      </div>
                      <div className="text-red-400 font-semibold text-lg mb-1">
                        NT$ {showtime.price}
                      </div>
                      <div className={`text-xs mt-2 ${
                        showtime.available_seats === 0 
                          ? 'text-gray-500' 
                          : showtime.available_seats < 10
                          ? 'text-orange-400'
                          : 'text-green-400'
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}