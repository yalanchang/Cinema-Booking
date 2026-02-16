'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Carousel from './components/Carousel';
import LoadingSpinner from './components/LoadingSpinner';
import NewsSection from './components/NewsSection';
import SpecialTheatersSection from './components/SpecialTheatersSection';
import MembershipSection from './components/MembershipSection';
import MovieFilterBar from './components/MovieFilterBar';
import MovieGrid from './components/MovieGrid';
import SectionHeader from './components/SectionHeader';

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


const getFilteredMovies = () => {
  if (!selectedDate && selectedTimeSlot === 'all') {
    return movies;
  }


  const filteredShowtimes = allShowtimes.filter(showtime => {
    let matchDate = true;
    let matchTime = true;

    if (selectedDate) {
      const showtimeDate = new Date(showtime.show_date).toISOString().split('T')[0];
      const filterDate = selectedDate.split('T')[0];
      matchDate = showtimeDate === filterDate;
      
          }

    if (selectedTimeSlot !== 'all') {
      const hour = parseInt(showtime.show_time.split(':')[0]);
      switch (selectedTimeSlot) {
        case 'morning':
          matchTime = hour >= 10 && hour < 12;
          break;
        case 'afternoon':
          matchTime = hour >= 12 && hour < 18;
          break;
        case 'evening':
          matchTime = hour >= 18 && hour < 22;
          break;
        case 'night':
          matchTime = hour >= 22 || hour < 2;
          break;
      }
    }

    return matchDate && matchTime;
  });


  const movieIdsWithShowtimes = new Set(
    filteredShowtimes.map(st => st.movie_id)
  );

  return movies.filter(movie => movieIdsWithShowtimes.has(movie.id));
};

  const filteredMovies = getFilteredMovies();
  const handleClearFilters = () => {
    setSelectedDate('');
    setSelectedTimeSlot('all');
  };
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
      <MovieFilterBar
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        filteredCount={filteredMovies.length}
        onDateChange={setSelectedDate}
        onTimeSlotChange={setSelectedTimeSlot}
        onClearFilters={handleClearFilters}
      />
      <main className="container mx-auto p-6">
        <SectionHeader
          title="現正熱映"
          showBorder
        />
        <MovieGrid
          movies={filteredMovies}
          onShowAll={handleClearFilters}
        />
      </main>
      <NewsSection />
      <SpecialTheatersSection />
      <MembershipSection />
    </div>
  );
}