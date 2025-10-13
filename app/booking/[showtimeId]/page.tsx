import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import BookingPageClient from './BookingPageClient';

export default async function BookingPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-n9 flex items-center justify-center p-6">
        <div className=" p-4 max-w-md w-full text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              需要登入會員
            </h2>
            <p className="text-gray-400">
              請先登入會員才能進行訂票
            </p>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              前往登入
            </Link>
            <Link
              href="/register"
              className="block w-full bg-n6 hover:bg-n7 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              註冊新帳號
            </Link>
            <Link
              href="/"
              className="block w-full text-gray-400 hover:text-white py-3 transition-colors"
            >
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BookingPageClient user={user} />;
}