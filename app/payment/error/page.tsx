'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || '付款處理失敗';

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-2xl p-8 text-center border border-red-500/50">
          
          {/* 錯誤圖示 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">付款失敗</h1>
          <p className="text-gray-400 mb-8">{message}</p>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 rounded-lg font-semibold
                bg-[#D26900] hover:bg-[#B85700] text-white
                transition-colors">
              返回首頁
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="block w-full py-3 rounded-lg font-semibold
                border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white
                transition-colors">
              重新嘗試
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}