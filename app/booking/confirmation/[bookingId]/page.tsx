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
    payment_status: string;
    payment_method: string;
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

    const getPaymentMethodName = (method: string) => {
        const methods: { [key: string]: string } = {
            'linepay': 'LINE Pay',
            'ecpay': '綠界科技',
            'credit': '信用卡',
            'atm': 'ATM轉帳',
            'cvs': '超商代碼',
        };
        return methods[method] || method;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D26900] mb-4"></div>
                    <div className="text-white text-xl">載入訂單中...</div>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-900">
                <div className="text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <div className="text-red-500 text-xl mb-4">❌ {error || '訂單不存在'}</div>
                    <Link
                        href="/"
                        className="inline-block bg-[#D26900] hover:bg-[#B85700] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        返回首頁
                    </Link>
                </div>
            </div>
        );
    }

    const seatCount = booking.seats.split(',').length;

    return (
        <div className="min-h-screen bg-neutral-900">

            {/* Header */}
            <header className="relative bg-gradient-to-br from-primary/70 via-primary/80 to-primary/90 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />

                <div className="container mx-auto px-6 py-12 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-2xl animate-bounce">
                            <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-5xl font-black mb-3 ">訂票成功</h1>
                        <p className="text-n8 text-xl mb-6">您的電影票已經預訂完成</p>

                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                            <span className="text-white text-sm">訂單編號</span>
                            <span className="text-white text-xl font-bold">#{booking.id}</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#171717" />
                    </svg>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">

                    <div className="bg-gradient-to-br from-n8 to-n9 rounded-xs shadow-2xl overflow-hidden border border-gray-700">

                        <div className="p-8 border-b border-n7">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-white mb-2">
                                        {booking.movie_title}
                                    </h2>

                                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                                        <span>{booking.genre}</span>
                                        <span>•</span>
                                        <span>{booking.duration}分鐘</span>
                                        <span>•</span>
                                        <span>{booking.rating}</span>
                                        {/* QR Code 區域 (可選) */}
                                        <div className="hidden md:block">
                                            <div className="w-24 h-24 bg-white rounded-xs flex items-center justify-center">
                                                <div className="text-xs text-gray-400">QR Code</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>



                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/5 backdrop-blur-sm rounded-xs p-4 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">放映日期</p>
                                    <p className="text-white font-semibold">{formatDate(booking.show_date)}</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-xs p-4 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">開演時間</p>
                                    <p className="text-white font-semibold text-xl">{formatTime(booking.show_time)}</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-xs p-4 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">放映廳</p>
                                    <p className="text-white font-semibold">{booking.theater_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-b border-gray-700 bg-n9/70">
                            <h3 className="text-lg font-bold text-white mb-4">您的座位</h3>
                            <div className="flex flex-wrap gap-2">
                                {booking.seats.split(',').map((seat, index) => (
                                    <div key={index} className="px-4 py-2 bg-[#D26900] text-white rounded-xs font-bold">
                                        {seat.trim()}
                                    </div>
                                ))}
                            </div>
                            <p className="text-gray-400 text-sm mt-3">共 {seatCount} 個座位</p>
                        </div>

                        <div className="p-8 border-b border-gray-700">
                            <h3 className="text-lg font-bold text-white mb-4">訂票人資訊</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">姓名</p>
                                    <p className="text-white font-semibold">{booking.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">電子郵件</p>
                                    <p className="text-white font-semibold">{booking.customer_email}</p>
                                </div>
                                {booking.customer_phone && (
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">聯絡電話</p>
                                        <p className="text-white font-semibold">{booking.customer_phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-n9/10 to-transparent">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">訂單總金額</p>
                                    <p className="text-[#D26900] text-4xl font-black">
                                        NT$ {booking.total_amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm mb-1">單價</p>
                                    <p className="text-white text-xl font-semibold">NT$ {booking.price}</p>
                                    <p className="text-gray-400 text-xs mt-1">x {seatCount} 張</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <p className="text-gray-400 text-sm">
                                    訂票時間：{formatDateTime(booking.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-gradient-to-br from-n9/30 to-n8/20 border border-n7 rounded-xs p-6">
                        <h3 className="text-primary font-bold text-lg mb-3">重要提醒</h3>
                        <ul className="space-y-2 text-primary/80 text-sm">
                            <li>• 確認郵件已發送至 {booking.customer_email}</li>
                            <li>• 請於放映前 15 分鐘到達影城取票</li>
                            <li>• 取票時請出示訂單編號：#{booking.id}</li>
                        </ul>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            href="/"
                            className="block text-center py-4 rounded-xs font-bold
                bg-[#D26900] hover:bg-[#B85700] text-white
                transition-all duration-300">
                            返回首頁
                        </Link>

                        <button
                            onClick={() => window.print()}
                            className="block w-full text-center py-4 rounded-xs font-semibold
                border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white
                transition-all duration-300">
                            列印票券
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}