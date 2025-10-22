'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthdate?: string;
  address?: string;
  city?: string;
  district?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  newsletter?: boolean;
  sms_notification?: boolean;
}

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
  ticket_type?: string;
  payment_method?: string;
  special_request?: string;
  qr_code?: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserInfo();
      fetchBookings();
    }
  }, [status, router]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const userData = await response.json();
      if (response.ok) {
        setUserInfo(userData);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

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
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calculateAmount = (bookings: Booking[]): number => {
    return bookings.reduce((sum, booking) => {
        const amount = typeof booking.total_amount === 'number' ? booking.total_amount : parseFloat(String(booking.total_amount)) || 0;
        return sum + amount ;
  },0);
}

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getGenderDisplay = (gender?: string) => {
    switch(gender) {
      case 'male': return '先生';
      case 'female': return '小姐';
      default: return '';
    }
  };

  const isUpcoming = (showDate: string, showTime: string) => {
    const showDateTime = new Date(`${showDate} ${showTime}`);
    return showDateTime > new Date();
  };

  const upcomingBookings = bookings.filter(b => isUpcoming(b.show_date, b.show_time));
  const historyBookings = bookings.filter(b => !isUpcoming(b.show_date, b.show_time));

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="text-white p-6 shadow-2xl border-b border-n8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/profile" className="text-gray-400 hover:text-white">
              返回會員中心
            </Link>
            <h1 className="text-2xl font-bold">訂票記錄</h1>
            <div className="w-24"></div>
          </div>
          
          {userInfo && (
              <div className="flex items-center justify-center text-center mt-4">
                <div>
                  <p className="text-primary  font-bold">
                    {userInfo.name} {getGenderDisplay(userInfo.gender)}
                  </p>
                  <p className="text-gray-400 text-sm">{userInfo.email}</p>
                </div>
              </div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* 分頁標籤 */}
          <div className="flex space-x-4 mb-6 border-b border-n7">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 px-4 font-semibold transition-colors cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-n4 hover:text-white'
              }` } 
            >
              即將觀看 ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-4 font-semibold transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-n4 hover:text-white'
              }`}
            >
              歷史記錄 ({historyBookings.length})
            </button>
          </div>

          {displayedBookings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-n4 text-xl mb-4">
                {activeTab === 'upcoming' ? '沒有即將觀看的電影' : '沒有歷史訂票記錄'}
              </p>
              <Link
                href="/"
                className="inline-block bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xs font-semibold transition-all"
              >
                立即訂票
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="bg-n8 rounded-xs p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {booking.movie_title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        訂單編號：#{booking.id.toString().padStart(8, '0')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xs text-sm font-semibold ${
                        booking.booking_status === 'confirmed'
                          ? 'bg-green-900 text-green-300'
                          : booking.booking_status === 'cancelled'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {booking.booking_status === 'confirmed' ? '已確認' : 
                         booking.booking_status === 'cancelled' ? '已取消' : '待處理'}
                      </span>
                      {activeTab === 'upcoming' && booking.booking_status === 'confirmed' && (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xs text-sm transition-colors">
                          電子票券
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

                  <button
                    onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                    className="text-primary hover:text-secondary text-sm font-semibold mb-3"
                  >
                    {selectedBooking === booking.id ? '收起詳細資訊 ▲' : '查看詳細資訊 ▼'}
                  </button>

                  {selectedBooking === booking.id && (
                    <div className="py-2 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">訂票人</p>
                          <p className="text-white">{userInfo?.name}</p>
                        </div>
                     
                        <div>
                          <p className="text-gray-400 text-sm mb-1">電子信箱</p>
                          <p className="text-white">{userInfo?.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">票種</p>
                          <p className="text-white">{booking.ticket_type || '全票'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">付款方式</p>
                          <p className="text-white">{booking.payment_method || '信用卡'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">訂票時間</p>
                          <p className="text-white">{formatDate(booking.created_at)}</p>
                        </div>
                      </div>
                     

                      {/* 通知設定狀態 */}
                      <div className="mt-4 pt-4 border-t border-n7">
                        <p className="text-gray-400 text-sm mb-2">通知設定</p>
                        <div className="flex gap-4">
                          <span className={`text-sm ${userInfo?.sms_notification ? 'text-green-400' : 'text-gray-500'}`}>
                            {userInfo?.sms_notification ? '✓ 簡訊通知已開啟' : '✗ 簡訊通知已關閉'}
                          </span>
                          <span className={`text-sm ${userInfo?.newsletter ? 'text-green-400' : 'text-gray-500'}`}>
                            {userInfo?.newsletter ? '✓ 電子報已訂閱' : '✗ 電子報未訂閱'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-n7">
                    <div className="flex gap-4">
                      {activeTab === 'upcoming' && (
                        <>
                          <button className="text-gray-400 hover:text-white text-sm transition-colors">
                            修改訂單
                          </button>
                          <button className="text-red-400 hover:text-red-300 text-sm transition-colors">
                            取消訂單
                          </button>
                        </>
                      )}
                      {activeTab === 'history' && (
                        <button className="text-gray-400 hover:text-white text-sm transition-colors">
                          再次訂購
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">總金額</p>
                      <p className="text-primary font-bold text-2xl">
                        NT$ {booking.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {bookings.length > 0 && (
            <div className="mt-8 bg-n8 rounded-xs p-6">
              <h3 className="text-white font-bold text-lg mb-4">訂票統計</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">總訂單數</p>
                  <p className="text-white text-2xl font-bold">{bookings.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">總消費金額</p>
                  <p className="text-primary text-2xl font-bold">
                NT$ {calculateAmount(bookings).toLocaleString()}
                  
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">最常去的影廳</p>
                  <p className="text-white text-lg font-semibold">
                    {bookings[0]?.theater_name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">會員等級</p>
                  <p className="text-yellow-500 text-lg font-semibold">
                    {bookings.length >= 10 ? 'VIP會員' : bookings.length >= 5 ? '銀卡會員' : '一般會員'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}