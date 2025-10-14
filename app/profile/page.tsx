'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  if (!session || !session.user) {
    return null;
  }

  const user = session.user;

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
              {/* 頭像 */}
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#D26900] flex items-center justify-center text-white text-4xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-gray-400">{user.email}</p>
                {user.phone && <p className="text-gray-400">{user.phone}</p>}
                
                {/* 顯示登入方式 */}
                {user.provider && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                      {user.provider === 'google' && (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google 帳號
                        </>
                      )}
                      {user.provider === 'facebook' && (
                        <>
                          <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook 帳號
                        </>
                      )}
                      {user.provider === 'local' && '一般帳號'}
                    </span>
                  </div>
                )}
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