'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Carousel from './components/Carousel';

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  genre: string;
  rating: string;
  poster_url: string;
  release_date: string;
  showtime_count: number;
}
interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  link: string;
}
interface Showtime {
  id: number;
  movie_id: number;
  show_date: string;
  show_time: string;
  price: number;
  available_seats: number;
  theater_name: string;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
  const [carouselSlides, setCarouselSlides] = useState<Slide[]>([]);


  useEffect(() => {
    fetchMoviesAndShowtimes();
  }, []);

  const fetchMoviesAndShowtimes = async () => {
    try {
      setLoading(true);

      // 取得所有電影
      const moviesResponse = await fetch('/api/movies');
      const moviesResult = await moviesResponse.json();

      if (!moviesResult.success) {
        setError(moviesResult.error || '無法載入電影列表');
        return;
      }

      setMovies(moviesResult.data);
      const slides = moviesResult.data.slice(0, 4).map((movie: Movie) => ({
        id: movie.id,
        image: movie.poster_url,
        title: movie.title,
        description: movie.description,
        link: `/movie/${movie.id}`
      }));
      
      setCarouselSlides(slides);
      
      // 取得所有場次（用於篩選）
      const showtimesPromises = moviesResult.data.map((movie: Movie) =>
        fetch(`/api/showtimes?movieId=${movie.id}`).then(res => res.json())
      );

      const showtimesResults = await Promise.all(showtimesPromises);
      const allShowtimesData = showtimesResults.flatMap(result =>
        result.success ? result.data : []
      );

      setAllShowtimes(allShowtimesData);
      setError(null);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('網路連線錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 產生未來7天的日期選項
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dates.push(dateString);
    }

    return dates;
  };

  const formatDateDisplay = (dateString: string) => {
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    const date = new Date(year, month, day);
    const days = ['日', '一', '二', '三', '四', '五', '六'];

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `今天 ${month + 1}/${day} (${days[date.getDay()]})`;
    }

    return `${month + 1}/${day} (${days[date.getDay()]})`;
  };

  // 篩選電影（根據日期和時段）
  const getFilteredMovies = () => {
    if (!selectedDate && selectedTimeSlot === 'all') {
      return movies;
    }

    // 篩選符合條件的場次
    const filteredShowtimes = allShowtimes.filter(showtime => {
      let matchDate = true;
      let matchTime = true;

      // 日期篩選
      if (selectedDate) {
        matchDate = showtime.show_date === selectedDate;
      }

      // 時段篩選
      if (selectedTimeSlot !== 'all') {
        const hour = parseInt(showtime.show_time.split(':')[0]);

        switch (selectedTimeSlot) {
          case 'morning': // 早場 (10:00-12:00)
            matchTime = hour >= 10 && hour < 12;
            break;
          case 'afternoon': // 午場 (12:00-18:00)
            matchTime = hour >= 12 && hour < 18;
            break;
          case 'evening': // 晚場 (18:00-22:00)
            matchTime = hour >= 18 && hour < 22;
            break;
          case 'night': // 深夜場 (22:00-02:00)
            matchTime = hour >= 22 || hour < 2;
            break;
        }
      }

      return matchDate && matchTime;
    });

    // 取得有符合場次的電影ID
    const movieIdsWithShowtimes = new Set(
      filteredShowtimes.map(st => st.movie_id)
    );

    // 只返回有符合場次的電影
    return movies.filter(movie => movieIdsWithShowtimes.has(movie.id));
  };

  const filteredMovies = getFilteredMovies();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <div className="text-white text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ {error}</div>
          <button
            onClick={fetchMoviesAndShowtimes}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 ">
      {carouselSlides.length > 0 && (
        <div className="w-full">
          <Carousel slides={carouselSlides} autoPlayInterval={5000} />
        </div>
      )}

      {/* 篩選區域 */}
      <div className="bg-neutral-900">
        <div className="container mx-auto p-6">
          {/* 篩選控制 */}
          <div className="flex  md:flex-coloum gap-6 md:justify-start md:items-center">
            
            {/* 日期 */}
            <div className="w-full md:w-[320px] relative group">
            <span className="text-sm">請選擇日期</span>

              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full py-4  text-white focus:outline-none border-b-1 border-transparent  hover:border-[#D26900] hover:text-gray-400 transition-all  duration-300 ease-in-out cursor-pointer peer"
              >
                <option value="">全部日期</option>
                {getDateOptions().map(date => (
                  <option key={date} value={date}>
                    {formatDateDisplay(date)}
                  </option>
                ))}
              </select>
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 peer-focus:w-full peer-focus:left-0 rounded-full"></span>

            </div>

            {/* 時段 */}
            <div className="w-full md:w-[320px] relative group">
              <span className="text-sm">請選擇時段</span>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full py-4 text-white focus:outline-none border-b-1 border-transparent  hover:text-gray-400 hover:border-[#D26900] transition-all  duration-300 ease-in-out cursor-pointer peer"
              >

                <option value="all">全部時段</option>
                <option value="morning">早場 (10:00-12:00)</option>
                <option value="afternoon">午場 (12:00-18:00)</option>
                <option value="evening">晚場 (18:00-22:00)</option>
                <option value="night">深夜場 (22:00-02:00)</option>
              </select>
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 peer-focus:w-full peer-focus:left-0 rounded-full"></span>

            </div>

            {/* 清除按鈕 */}
            {(selectedDate || selectedTimeSlot !== 'all') && (
              <button
                onClick={() => {
                  setSelectedDate('');
                  setSelectedTimeSlot('all');
                }}
                className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all whitespace-nowrap"
              >
                ✖ 清除篩選
              </button>
            )}
          </div>

          {/* 結果提示 */}
          {(selectedDate || selectedTimeSlot !== 'all') && (
            <div className="mt-4 p-3  ">
              <p className="text-gray-300 text-sm md:text-right">
                找到 <span className="text-red-400 font-bold">{filteredMovies.length}</span> 部符合條件的電影
              </p>
            </div>
          )}
        </div>
      </div>
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">熱映中</h2>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-xl mb-2">沒有符合條件的電影</p>
            <p className="text-sm mt-2">試試調整篩選條件或選擇其他日期</p>
            <button
              onClick={() => {
                setSelectedDate('');
                setSelectedTimeSlot('all');
              }}
              className="mt-6 bg-primary text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              顯示全部電影
            </button>
          </div>
        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMovies.map((movie) => (
              <Link
                href={`/movies/${movie.id}`}
                key={movie.id}
                className="block overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-primary/10 cursor-pointer"
              >
                <div className="relative h-96 bg-gray-700 overflow-hidden group">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x450/1f2937/ffffff?text=' + encodeURIComponent(movie.title);
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                    {movie.rating}
                  </div></div>
          
                {/* 電影資訊 */}
                <div className="p-4 bg-gray-950 ">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#D26900] transition-colors">
                    {movie.title}
                  </h3>
          
                  <div className="flex gap-2 mb-16 flex-wrap">
                    {movie.genre.split('/').map((g, i) => (
                      <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                        {g.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}