'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Carousel from './components/Carousel';
import LoadingSpinner from './components/LoadingSpinner';

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
  const [expectedCount, setExpectedCount] = useState(12);
  const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
  const [carouselSlides, setCarouselSlides] = useState<Slide[]>([]);


  useEffect(() => {
    fetchMoviesAndShowtimes();
    fetchCarouselSlides();

  }, []);

  const fetchCarouselSlides = async () => {
    try {
      const response = await fetch('/api/carousel');
      const result = await response.json();

      if (result.success) {
        const slides = result.data.map((slide: any) => ({
          id: slide.id,
          image: slide.image_url,
          title: slide.title,
          description: slide.description,
          link: slide.link_url || '#'
        }));
        setCarouselSlides(slides);
      }
    } catch (err) {
      console.error('Error fetching carousel slides:', err);
    }
  };
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
    return <LoadingSpinner />;
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
        <div className="w-full h-full">
          <Carousel slides={carouselSlides} autoPlayInterval={5000} />
        </div>
      )}

      {/* 篩選區域 */}
      <div className="bg-n9">
        <div className="container mx-auto p-6">
          {/* 篩選控制 */}
          <div className="flex w-full justify-start md:flex-row gap-20 md:items-center" >

            {/* 日期 */}
            <div className="w-full md:w-[360px] relative group">
              <span className="text-sm text-white">請選擇日期</span>
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
            <div className="w-full md:w-[360px] relative group">
              <span className="text-sm text-white">請選擇時段</span>
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
            <div className="flex items-center gap-8 ml-auto ">
              {/* 清除按鈕 */}
              {(selectedDate || selectedTimeSlot !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedDate('');
                    setSelectedTimeSlot('all');
                  }}
                  className="w-full  md:w-auto px-4 py-2 bg-primary hover:bg-secondary text-white rounded-xs  transition-all font-medium whitespace-nowrap "
                >
                  清除篩選
                </button>
              )}
              {/* 結果提示 */}
              {(selectedDate || selectedTimeSlot !== 'all') && (
                <div className="">
                  <p className="text-gray-300 text-sm md:text-right">
                    共 <span className="text-primary font-bold">{filteredMovies.length}</span> 部電影
                  </p>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
      <main className="container mx-auto p-6">
        <div className="mb-8 border-b border-n7 pb-4 ">
          <h2 className="text-3xl font-bold text-white ">現正熱映</h2>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ">
            {filteredMovies.map((movie) => (
              <Link
                href={`/movies/${movie.id}`}
                key={movie.id}
                className="group block cursor-pointer"
              >
                <div className="relative overflow-hidden
               border border-gray-800
               transition-all duration-500
               hover:border-[#D26900]
               group-hover:scale-105
               hover:shadow-[0_0_30px_rgba(210,105,0,0.1)]">

                  {/* 海報 */}
                  <div className="relative h-96 bg-black overflow-hidden">
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-full object-cover
                     transition-all duration-700
                     group-hover:brightness-110"
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

                    {/* 底部漸變 + 訂票按鈕 */}
                    <div className="absolute bottom-0 left-0 right-0
                   bg-gradient-to-t from-black via-black/80 to-transparent
                   p-6
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-500">

                      {/* 電影時長 */}
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

                  {/* 資訊區 */}
                  <div className="p-5 bg-neutral-900">
                    <h3 className="text-lg font-medium text-white mb-4
                   transition-colors duration-300
                   group-hover:text-[#D26900]">
                      {movie.title}
                    </h3>

                    {/* 類型 - 用分隔符號 */}
                    <p className="text-sm text-gray-500">
                      {movie.genre.split('/').map((g, i, arr) => (
                        <span key={i}>
                          <span className="transition-colors duration-300 group-hover:text-gray-400">
                            {g.trim()}
                          </span>
                          {i < arr.length - 1 && <span className="mx-2">•</span>}
                        </span>
                      ))}
                    </p>
                    <div className="flex gap-2 mt-8
        opacity-0 group-hover:opacity-100
        transform translate-y-2 group-hover:translate-y-0
        transition-all duration-500">

                      {/* 查看詳情 */}
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

                      {/* 立即訂票 */}
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
              </Link>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}