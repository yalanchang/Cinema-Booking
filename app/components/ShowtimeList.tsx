import { useRouter } from 'next/navigation';


export interface Showtime {
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

interface ShowtimeListProps {
  filteredShowtimes: Showtime[];
  formatTime: (timeString: string) => string;
  router: ReturnType<typeof useRouter>; 
}

export default function ShowtimeList({
  filteredShowtimes,
  formatTime,
  router,
}: ShowtimeListProps) {
  const groupedShowtimes = filteredShowtimes.reduce((acc, showtime) => {
    const theater = showtime.theater_name;
    if (!acc[theater]) {
      acc[theater] = [];
    }
    acc[theater].push(showtime);
    return acc;
  }, {} as { [key: string]: Showtime[] });

  return (
    <>
      {Object.entries(groupedShowtimes).map(([theaterName, showtimes]) => (
        <div key={theaterName}>
          <div className="flex items-center gap-3 mb-4 ">
            <div className="bg-primary w-1 h-6"></div>
            <h3 className="text-xl font-medium text-white">{theaterName}</h3>
            <div className="flex-1 h-px bg-neutral-800"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {showtimes.map((showtime) => (
              <button
                key={showtime.id}
                onClick={() => router.push(`/booking/${showtime.id}`)}
                disabled={showtime.available_seats === 0}
                className={`p-2  transition-all duration-200 ${showtime.available_seats === 0
                  ? 'bg-neutral-900  text-gray-800 cursor-not-allowed opacity-50'
                  : 'bg-neutral-800  hover:bg-neutral-900 text-white cursor-pointer '
                  }`}
              >
                <div className="text-xl font-medium mb-2 text-start">
                  {formatTime(showtime.show_time)}
                </div>
                <div className={`text-xs text-start py-1.5 rounded-full ${showtime.available_seats === 0
                  ? 'bg-gray-800 text-gray-600'
                  : showtime.available_seats < 10
                    ? 'text-orange-400'
                    : 'text-gray-600'
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
    </>
  );
}