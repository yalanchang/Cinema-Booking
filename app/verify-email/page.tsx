
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('缺少驗證 token');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage(result.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('驗證失敗，請稍後再試');
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'success' ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">驗證成功！</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-[#D26900] hover:bg-[#B85700] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              前往登入
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">驗證失敗</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full bg-[#D26900] hover:bg-[#B85700] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                前往登入
              </Link>
              <Link
                href="/"
                className="block text-gray-400 hover:text-white transition-colors"
              >
                返回首頁
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}