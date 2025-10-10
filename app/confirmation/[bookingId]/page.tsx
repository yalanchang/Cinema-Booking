'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface BookingDetails {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  booking_status: string;
  show_date: string;
  show_time: string;
  price: number;
  movie_title: string;
  theater_name: string;
  seats: string;
  created_at: string;
  duration: number;
  genre: string;
  rating: string;
}

export default function ConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId;
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?bookingId=${bookingId}`);
      const result = await response.json();
      
      if (result.success) {
        setBooking(result.data);
        setError(null);
      } else {
        setError(result.error || '訂單不存在');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('網路連線錯誤，請稍後再試');
    } finally {
      setLoading(false);
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
    
    return `${year}年${date.getMonth() + 1}月${date.getDate()}日 星期${days[date.getDay()]}`;
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };
  
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <div className="text-white text-xl">載入訂單中...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-red-500 text-xl mb-4">❌ {error || '訂單不存在'}</div>
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

  const seatCount = booking.seats.split(',').length;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-2xl">
        <div className="container mx-auto text-center">
          <div className="inline-block bg-white rounded-full p-4 mb-4">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">訂票成功！</h1>
          <p className="text-green-100 text-lg">您的電影票已經預訂完成</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {/* 訂單編號 */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 border-b border-gray-700">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">訂單編號</p>
                <p className="text-white text-3xl font-bold">#{booking.id}</p>
                <p className="text-gray-400 text-sm mt-2">
                  訂票時間：{formatDateTime(booking.created_at)}
                </p>
              </div>
            </div>

            {/* 電影資訊 */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                🎬 電影資訊
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">電影名稱</span>
                  <span className="text-white font-semibold text-lg">{booking.movie_title}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">類型 / 片長 / 分級</span>
                  <span className="text-white font-semibold">
                    {booking.genre} / {booking.duration}分 / {booking.rating}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">放映日期</span>
                  <span className="text-white font-semibold">{formatDate(booking.show_date)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">放映時間</span>
                  <span className="text-white font-semibold text-lg">{formatTime(booking.show_time)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">影廳</span>
                  <span className="text-white font-semibold">{booking.theater_name}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">座位</span>
                  <span className="text-white font-semibold">{booking.seats}</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">座位數量</span>
                  <span className="text-white font-semibold">{seatCount} 張</span>
                </div>
              </div>

              {/* 訂票人資訊 */}
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 mt-8">
                訂票人資訊
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">姓名</span>
                  <span className="text-white font-semibold">{booking.customer_name}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">電子郵件</span>
                  <span className="text-white font-semibold">{booking.customer_email}</span>
                </div>

                {booking.customer_phone && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400">聯絡電話</span>
                    <span className="text-white font-semibold">{booking.customer_phone}</span>
                  </div>
                )}
              </div>

              {/* 金額資訊 */}
              <div className="bg-gradient-to-r from-red-900 to-red-800 bg-opacity-30 border-2 border-red-700 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">訂單總金額</p>
                    <p className="text-red-400 text-4xl font-bold">
                      NT$ {booking.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">單價</p>
                    <p className="text-white text-lg">NT$ {booking.price}</p>
                  </div>
                </div>
              </div>

              {/* 提醒訊息 */}
              <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-xl p-6 mb-8">
                <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                  重要提醒
                </h3>
                <ul className="space-y-2 text-blue-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>確認郵件已發送至 {booking.customer_email}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>請於放映前 15 分鐘到達影城取票</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>取票時請出示訂單編號：#{booking.id}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>如需更改或取消訂單，請聯絡客服</span>
                  </li>
                </ul>
              </div>

              {/* 操作按鈕 */}
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-lg font-bold text-lg transition-all hover:shadow-lg"
                >
                  返回首頁
                </Link>
                
                <button
                  onClick={() => window.print()}
                  className="block w-full bg-gray-700 hover:bg-gray-600 text-white text-center py-4 rounded-lg font-semibold transition-all hover:shadow-lg no-print"
                >
                  列印訂單
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 列印專用樣式 */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          header {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}