'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = '/';
      } else {
        setError(result.error || '操作失敗');
      }
    } catch (err) {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
     <img src="/register.jpg" className="w-full h-full mx-auto " />

      <div className="max-w-md w-full">
        <div className="text-center mb-4">
          <p className="text-gray-400 mt-2">
            {isLogin ? '登入您的帳號' : '建立新帳號'}
          </p>
        </div>

        {/* 表單 */}
        <div className=" p-8 ">
          {/* 切換登入/註冊 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-xs font-semibold transition-all ${
                isLogin
                  ? 'bg-[#D26900] text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              登入
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-xs font-semibold transition-all ${
                !isLogin
                  ? 'bg-[#D26900] text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              註冊
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-xs text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-xs focus:outline-none focus:ring-2 focus:ring-[#D26900]"
                  placeholder="請輸入姓名"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-xs focus:outline-none focus:ring-2 focus:ring-[#D26900]"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                密碼 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-xs focus:outline-none focus:ring-2 focus:ring-[#D26900]"
                placeholder="至少 6 個字元"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  電話
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-xs focus:outline-none focus:ring-2 focus:ring-[#D26900]"
                  placeholder="0912-345-678"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D26900] hover:bg-[#B85700] disabled:bg-gray-600 text-white py-3 rounded-xs font-bold text-lg transition-all disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : isLogin ? '登入' : '註冊'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
            返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}