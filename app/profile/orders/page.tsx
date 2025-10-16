'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Booking {
  id: number;
  movie_title: string;
  show_date: string;
  show_time: string;
  theater_name: string;
  seats: string;
  total_amount: number;
  booking_status: string;
  created_at: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/auth/bookings');
      const result = await response.json();
      
      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Loading 狀態
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  // 未登入（這個其實不會執行到，因為上面的 useEffect 會導向登入頁）
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="text-white p-6 shadow-2xl border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/profile" className="text-gray-400 hover:text-white">
        返回會員中心
          </Link>
          <h1 className="text-2xl font-bold">訂票記錄</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl mb-4">尚無訂票記錄</p>
              <Link
                href="/"
                className="inline-block bg-[#D26900] hover:bg-[#B85700] text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                立即訂票
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-gray-800 rounded-xl p-6 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {booking.movie_title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        訂單編號：#{booking.id}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.booking_status === 'confirmed'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {booking.booking_status === 'confirmed' ? '已確認' : '待處理'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">放映日期</p>
                      <p className="text-white font-semibold">
                        {formatDate(booking.show_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">放映時間</p>
                      <p className="text-white font-semibold">
                        {formatTime(booking.show_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">影廳</p>
                      <p className="text-white font-semibold">
                        {booking.theater_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">座位</p>
                      <p className="text-white font-semibold">
                        {booking.seats}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-gray-400 text-sm">訂票時間</p>
                      <p className="text-gray-300 text-sm">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">總金額</p>
                      <p className="text-[#D26900] font-bold text-2xl">
                        NT$ {booking.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}