'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <header className="text-white p-6 shadow-2xl border-b border-gray-800">
        <div className="container mx-auto">
          <Link href="/" className="text-gray-400 hover:text-white">
            ← 返回首頁
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* 個人資訊卡片 */}
          <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-[#D26900] flex items-center justify-center text-white text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-gray-400">{user.email}</p>
                {user.phone && <p className="text-gray-400">{user.phone}</p>}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-xl font-bold text-white mb-4">帳號資訊</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">會員編號</p>
                  <p className="text-white font-semibold">#{user.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white font-semibold">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">電話</p>
                    <p className="text-white font-semibold">{user.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 功能選單 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/profile/orders"
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D26900] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">訂票記錄</h3>
                  <p className="text-gray-400 text-sm">查看您的訂票歷史</p>
                </div>
              </div>
            </Link>

            <Link
              href="/"
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D26900] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">立即訂票</h3>
                  <p className="text-gray-400 text-sm">瀏覽最新電影</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}