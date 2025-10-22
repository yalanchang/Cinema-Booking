'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import LoadingSpinner from './LoadingSpinner'

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
     return <LoadingSpinner />;
   
  }

  if (!session || !session.user) {
    return (
      <Link
        href="/login"
        className="px-6 py-2 bg-[#D26900] hover:bg-[#B85700] text-white rounded-xs font-semibold transition-all whitespace-nowrap"
      >
        登入
      </Link>
    );
  }

  const user = session.user;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 transition-all cursor-pointer"
      >
        {/* 頭像 */}
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#D26900] flex items-center justify-center text-white font-bold">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        
        <span className="text-white font-semibold hidden md:block whitespace-nowrap">
          {user.name}
        </span>
        
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-n8 rounded-xs shadow-2xl border border-n7 py-2 z-50">
          {/* 使用者資訊 */}
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-white font-semibold">{user.name}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
            {session.user.provider && (
              <p className="text-xs text-gray-500 mt-1">
                透過 {session.user.provider === 'google' ? 'Google' : session.user.provider === 'facebook' ? 'Facebook' : '一般'} 登入
              </p>
            )}
          </div>

          {/* 選單項目 */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-n7 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            會員中心
          </Link>

          <Link
            href="/profile/orders"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-n7hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            訂票記錄
          </Link>

          <div className="border-t border-gray-700 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-n7 hover:text-red-300 transition-colors w-full text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  );
}