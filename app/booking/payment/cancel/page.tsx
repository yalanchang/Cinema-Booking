'use client';

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-2xl p-8 text-center border border-yellow-500/50">
          
          {/* 警告圖示 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">付款已取消</h1>
          <p className="text-gray-400 mb-8">您已取消此次付款交易</p>

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
              返回付款頁面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}