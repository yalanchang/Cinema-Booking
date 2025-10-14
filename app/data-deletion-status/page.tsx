'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DataDeletionStatusPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          資料刪除請求已處理
        </h1>
        <p className="text-gray-400 mb-2">
          您的帳號和相關資料已從我們的系統中刪除。
        </p>
        {code && (
          <p className="text-gray-500 text-sm mt-4">
            確認代碼：{code}
          </p>
        )}
        <Link
          href="/"
          className="inline-block mt-6 bg-[#D26900] hover:bg-[#B85700] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          返回首頁
        </Link>
      </div>
    </div>
  );
}