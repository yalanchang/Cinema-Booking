'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RecommendedMovies from '@/app/components/RecommendedMovies';
import MovieGallery from '@/app/components/MovieGallery';
import Animations from '@/app/components/Animations';
import DateSelector from '@/app/components/DateSelector';
import ShowtimeList,{ Showtime } from '@/app/components/ShowtimeList';
import LoadingSpinner from '../../components/LoadingSpinner';


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
  const movieId = params.id as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [carouselSlides, setCarouselSlides] = useState<any[]>([]);

  useEffect(() => {
    if (movieId) {
      fetchMovieAndShowtimes();
      fetchCarouselSlides();
    }
  }, [movieId]);

  const fetchCarouselSlides = async () => {

    try {
      const response = await fetch(`/api/movies/${movieId}/images`);
      const data = await response.json();
      const slides = data.data.map((item: any) => ({
        id: item.id,
        image: item.image_url,
        title: item.image_type,
        link: `/movies/${movieId}/images/${item.id}`,

      }));

      setCarouselSlides(slides);
    } catch (err) {
      console.error('Error fetching carousel slides:', err);
    }
  };


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
    return <LoadingSpinner />;
  }
  const availableDates = getAvailableDates();
  const filteredShowtimes = getShowtimesByDate();
  const movieTitle = movie?.title || (showtimes.length > 0 ? showtimes[0].movie_title : '電影');
  const videoId = movie?.trailer_url ? getVideoId(movie.trailer_url) : null;

  return (
    <div className="min-h-screen bg-neutral-950">


      {/* 電影資訊區 */}
      <div className="bg-neutral-900/30">
        <div className=" mx-auto ">

          <div className=" relative">
            <div
              onClick={() => videoId && setIsTrailerOpen(true)}
              className={`relative h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden shadow-2xl ${videoId ? 'cursor-pointer group' : ''}`}
            >
              <img
                src={movie?.poster_url || 'https://via.placeholder.com/400x600'}
                alt={movieTitle}
                className="w-full h-full transition-transform duration-300 object-cover "
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x600/1f2937/ffffff?text=' + encodeURIComponent(movieTitle);
                }}
              />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent"></div>
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/50 to-transparent"></div>


              <div className="absolute bottom-0 left-0 text-white px-8 pb-8 ">
                <h3 className="text-3xl  drop-shadow-2xl">{movieTitle}</h3>
              </div>
              {videoId && (
                <div className="absolute inset-0   transition-opacity duration-300 flex flex-col items-center justify-center">
                  <div className="rounded-full p-4  bg-white/8 backdrop-blur-sm   transform scale-60 hover:scale-65 transition-transform shadow-xl mb-4">
                    <svg className="w-16 h-16 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="text-white  px-8 py-12 bg-gradient-to-t from-transparent via-black/50 to-black ">
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
                        <path d="M8 5v14l11-7z" />
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
      <main className="w-full px-8 py-12 bg-gradient-to-b from-neutral-900/30 via-black to-black">
        {error ? (
          <div className="text-center text-gray-400 py-20 ">
            <div className="text-red-500 text-xl mb-4">❌ {error}</div>
            <button
              onClick={fetchMovieAndShowtimes}
              className="bg-[#D26900] hover:bg-[#B85800] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              重新載入
            </button>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="text-center text-gray-400 py-20 ">
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
            <DateSelector
              availableDates={availableDates}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              formatDate={formatDate}
              isToday={isToday}
            />
            {/* 場次列表 */}
            {selectedDate && (
              <div>
                {filteredShowtimes.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 bg-neutral-900 rounded-lg">
                    <p className="text-lg">此日期暫無場次</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* 影廳 */}
                    <ShowtimeList
                      filteredShowtimes={filteredShowtimes}
                      formatTime={formatTime}
                      router={router}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      {carouselSlides.length > 0 ? (
        <MovieGallery slides={carouselSlides} autoPlayInterval={5000} />
      ) : (
        <p>載入中...</p>
      )}
      <RecommendedMovies currentMovieId={movieId} />
      {isTrailerOpen && videoId && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-100 animate-fadeIn "
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
      <Animations />
    </div>
  );
}