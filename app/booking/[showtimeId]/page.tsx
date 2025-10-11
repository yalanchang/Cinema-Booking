'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Seat {
  id: number;
  theater_id: number;
  row_label: string;
  seat_number: number;
}

interface ShowtimeInfo {
  id: number;
  movie_id: number;
  movie_title: string;
  theater_name: string;
  show_date: string;
  show_time: string;
  price: number;
  available_seats: number;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const showtimeId = params.showtimeId;

  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<number[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [showtimeInfo, setShowtimeInfo] = useState<ShowtimeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (showtimeId) {
      fetchSeats();
    }
  }, [showtimeId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seats?showtimeId=${showtimeId}`);
      const result = await response.json();

      if (result.success) {
        setSeats(result.data.seats);
        setBookedSeatIds(result.data.bookedSeatIds);
        setShowtimeInfo(result.data.showtime);
        setError(null);
      } else {
        setError(result.error || '無法載入座位資訊');
      }
    } catch (err) {
      console.error('Error fetching seats:', err);
      setError('網路連線錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatId: number) => {
    if (bookedSeatIds.includes(seatId)) return;

    setSelectedSeatIds(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSeatIds.length === 0) {
      alert('請至少選擇一個座位');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      alert('請填寫姓名和電子郵件');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showtimeId,
          seatIds: selectedSeatIds,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.data.message);
        router.push(`/confirmation/${result.data.bookingId}`);
      } else {
        alert(result.error || '訂票失敗');
        fetchSeats();
        setSelectedSeatIds([]);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('訂票失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    const parts = dateString.split('T')[0].split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    const date = new Date(year, month, day);
    const days = ['日', '一', '二', '三', '四', '五', '六'];

    return `${date.getMonth() + 1}月${date.getDate()}日 星期${days[date.getDay()]}`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const getSelectedSeatsDisplay = () => {
    if (selectedSeatIds.length === 0) return '尚未選擇';

    return selectedSeatIds
      .map(id => {
        const seat = seats.find(s => s.id === id);
        return seat ? `${seat.row_label}${seat.seat_number}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  const calculateTotal = () => {
    if (!showtimeInfo || selectedSeatIds.length === 0) return 0;
    return showtimeInfo.price * selectedSeatIds.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <div className="text-white text-xl">載入座位中...</div>
        </div>
      </div>
    );
  }

  if (error || !showtimeInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ {error || '場次不存在'}</div>
          <Link
            href="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row_label]) {
      acc[seat.row_label] = [];
    }
    acc[seat.row_label].push(seat);
    return acc;
  }, {} as { [key: string]: Seat[] });

  const rows = Object.keys(groupedSeats).sort();

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-2xl">
        <div className="container mx-auto">
          <Link
            href={`/movie/${showtimeInfo.movie_id}`}
            className="text-red-100 hover:text-white mb-3 inline-flex items-center gap-2 transition-colors"
          >
            ← 返回場次選擇
          </Link>
          <h1 className="text-4xl font-bold mb-2">{showtimeInfo.movie_title}</h1>
          <div className="flex flex-wrap gap-4 text-red-100">
            <span>📅 {formatDate(showtimeInfo.show_date)}</span>
            <span>🕐 {formatTime(showtimeInfo.show_time)}</span>
            <span>🏛️ {showtimeInfo.theater_name}</span>
            <span>💰 NT$ {showtimeInfo.price} / 張</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">選擇座位</h2>

              <div className="mb-8">
                <div className="bg-gradient-to-b from-gray-700 to-gray-800 text-white text-center py-4 rounded-lg mb-4 shadow-lg">
                  <div className="text-xl font-bold">🎬 銀幕</div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {rows.map(row => (
                  <div key={row} className="flex items-center gap-3">
                    <div className="w-10 text-white font-bold text-center text-lg">
                      {row}
                    </div>
                    <div className="flex gap-2 flex-1 justify-center">
                      {groupedSeats[row].map(seat => {
                        const isBooked = bookedSeatIds.includes(seat.id);
                        const isSelected = selectedSeatIds.includes(seat.id);

                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat.id)}
                            disabled={isBooked}
                            className={`w-11 h-11 rounded-t-xl text-sm font-semibold transition-all duration-200 ${isBooked
                                ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-red-600 text-white scale-110 shadow-lg'
                                  : 'bg-green-600 text-white hover:bg-green-500 hover:scale-105'
                              }`}
                            title={`${row}${seat.seat_number}${isBooked ? ' (已售)' : ''}`}
                          >
                            {seat.seat_number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-8 text-sm border-t border-gray-700 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-t-xl"></div>
                  <span className="text-gray-300">可選</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-t-xl"></div>
                  <span className="text-gray-300">已選</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-t-xl"></div>
                  <span className="text-gray-300">已售</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl sticky top-6">
              <h3 className="text-2xl font-bold text-white mb-6">訂票資訊</h3>

              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="text-gray-400 text-sm mb-2">已選座位</div>
                <div className="text-white font-semibold text-lg">
                  {getSelectedSeatsDisplay()}
                </div>
                {selectedSeatIds.length > 0 && (
                  <div className="text-gray-400 text-sm mt-2">
                    共 {selectedSeatIds.length} 個座位
                  </div>
                )}
              </div>

              <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">總金額</span>
                  <span className="text-red-400 font-bold text-2xl">
                    NT$ {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    placeholder="請輸入姓名"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">
                    電子郵件 *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">
                    聯絡電話
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    placeholder="09xx-xxx-xxx"
                  />
                </div>

                <button
                  type="submit"
                  disabled={selectedSeatIds.length === 0 || isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-all hover:shadow-lg disabled:hover:shadow-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      處理中...
                    </span>
                  ) : (
                    `確認訂票 (${selectedSeatIds.length} 個座位)`
                  )}
                </button>

                {selectedSeatIds.length === 0 && (
                  <p className="text-gray-400 text-sm text-center">
                    請先選擇座位
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}