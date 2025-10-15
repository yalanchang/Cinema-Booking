// app/booking/[showtimeId]/payment/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingInfo {
  booking_id: number;
  total_amount: number;
  movie_title: string;
  show_date: string;
  show_time: string;
  seats: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<'linepay' | 'ecpay' | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const bookingData = sessionStorage.getItem('pendingBooking');
    if (bookingData) {
      setBooking(JSON.parse(bookingData));
    }
    setLoading(false);
  }, []);

  // LINE Pay 付款
  const handleLinePayment = async () => {
    if (!booking) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/payments/linepay/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.booking_id,
          amount: booking.total_amount,
          productName: `${booking.movie_title} 電影票`,
        }),
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        // 跳轉到 LINE Pay 付款頁面
        window.location.href = result.paymentUrl;
      } else {
        alert('LINE Pay 付款請求失敗: ' + result.error);
        setProcessing(false);
      }
    } catch (error) {
      console.error('LINE Pay Error:', error);
      alert('付款請求失敗，請稍後再試');
      setProcessing(false);
    }
  };

  // 綠界付款
  const handleECPayment = async () => {
    if (!booking) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/payments/ecpay/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.booking_id,
          amount: booking.total_amount,
          itemName: `${booking.movie_title} 電影票`,
        }),
      });

      const result = await response.json();

      if (result.success && result.formData) {
        // 動態建立表單並提交
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.formData.action;

        Object.keys(result.formData).forEach((key) => {
          if (key !== 'action') {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = result.formData[key];
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert('綠界付款請求失敗: ' + result.error);
        setProcessing(false);
      }
    } catch (error) {
      console.error('ECPay Error:', error);
      alert('付款請求失敗，請稍後再試');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D26900] mb-4"></div>
          <div className="text-white text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">找不到訂單資訊</p>
          <Link href="/" className="text-[#D26900] hover:text-[#B85700]">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white">選擇付款方式</h1>
          <p className="text-gray-400 mt-2">請選擇您偏好的付款方式完成訂單</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* 訂單摘要 */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">訂單摘要</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>電影</span>
                <span className="text-white font-semibold">{booking.movie_title}</span>
              </div>
              <div className="flex justify-between">
                <span>場次</span>
                <span className="text-white">
                  {booking.show_date} {booking.show_time}
                </span>
              </div>
              <div className="flex justify-between">
                <span>座位</span>
                <span className="text-white">{booking.seats}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-700">
                <span className="text-lg font-semibold">總金額</span>
                <span className="text-2xl font-bold text-[#D26900]">
                  NT$ {booking.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 付款方式選擇 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* LINE Pay */}
            <button
              onClick={() => setSelectedMethod('linepay')}
              disabled={processing}
              className={`
                relative p-8 rounded-xl border-2 transition-all duration-300
                ${selectedMethod === 'linepay'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-green-500/50'
                }
                ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}>
              
              {/* 選中標記 */}
              {selectedMethod === 'linepay' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* LINE Pay Logo */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-black text-2xl">LINE</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">LINE Pay</h3>
                <p className="text-gray-400 text-sm text-center">
                  使用 LINE Pay 快速付款
                </p>
              </div>
            </button>

            {/* 綠界 ECPay */}
            <button
              onClick={() => setSelectedMethod('ecpay')}
              disabled={processing}
              className={`
                relative p-8 rounded-xl border-2 transition-all duration-300
                ${selectedMethod === 'ecpay'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-blue-500/50'
                }
                ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}>
              
              {/* 選中標記 */}
              {selectedMethod === 'ecpay' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* ECPay Logo */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">綠界科技</h3>
                <p className="text-gray-400 text-sm text-center">
                  信用卡 / ATM / 超商付款
                </p>
              </div>
            </button>
          </div>

          {/* 付款按鈕 */}
          <div className="space-y-4">
            <button
              onClick={() => {
                if (selectedMethod === 'linepay') handleLinePayment();
                else if (selectedMethod === 'ecpay') handleECPayment();
              }}
              disabled={!selectedMethod || processing}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all
                ${!selectedMethod || processing
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#D26900] hover:bg-[#B85700] text-white shadow-lg hover:shadow-[#D26900]/50'
                }
              `}>
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  處理中...
                </span>
              ) : (
                selectedMethod ? '前往付款' : '請選擇付款方式'
              )}
            </button>

            <button
              onClick={() => router.back()}
              disabled={processing}
              className="w-full py-4 rounded-xl font-semibold text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white transition-all">
              返回上一步
            </button>
          </div>

          {/* 安全提示 */}
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">安全付款保證</p>
                <ul className="space-y-1 text-blue-300">
                  <li>• 所有交易均經過 SSL 加密保護</li>
                  <li>• 我們不會儲存您的信用卡資訊</li>
                  <li>• 付款資訊由第三方金流服務商處理</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}