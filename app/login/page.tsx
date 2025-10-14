'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
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
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        phone?: string;
        general?: string;
    }>({});
    const [loading, setLoading] = useState(false);

    // ✅ Google 登入
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            console.error('Google 登入失敗:', error);
            setErrors({ general: 'Google 登入失敗' });
        } finally {
            setLoading(false);
        }
    };

    // ✅ Facebook 登入
    const handleFacebookLogin = async () => {
        try {
            setLoading(true);
            await signIn('facebook', { callbackUrl: '/' });
        } catch (error) {
            console.error('Facebook 登入失敗:', error);
            setErrors({ general: 'Facebook 登入失敗' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            if (isLogin) {
                // ✅ 使用 NextAuth 登入
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) {
                    setErrors({ general: result.error });
                } else {
                    router.push('/');
                    router.refresh();
                }
            } else {
                // ✅ 一般註冊
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    setErrors({
                        general: '註冊成功！請檢查您的信箱並點擊驗證連結。5 秒後跳轉到登入...'
                    });

                    setTimeout(() => {
                        setIsLogin(true);
                        setErrors({});
                    }, 5000);
                } else {
                    if (data.error.includes('Email')) {
                        setErrors({ email: data.error });
                    } else if (data.error.includes('密碼')) {
                        setErrors({ password: data.error });
                    } else {
                        setErrors({ general: data.error });
                    }
                }
            }
        } catch (err) {
            setErrors({ general: '網路錯誤，請稍後再試' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field as keyof typeof errors]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center relative overflow-hidden">
            <img
                src="/register.jpg"
                className="absolute w-full h-full object-cover transition-transform duration-300 ease-out"
                style={{
                    transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.1)`,
                }}
                alt="背景"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/60" />

            <div className="relative z-10 max-w-md w-full">
                <div className="text-center mb-4">
                    <p className="text-gray-400 mt-2">
                        {isLogin ? '登入您的帳號' : '建立新帳號'}
                    </p>
                </div>

                <div className="p-8">


                    {/* 切換登入/註冊 */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => {
                                setIsLogin(true);
                                setErrors({});
                            }}
                            className={`flex-1 py-2 cursor-pointer rounded-xs font-semibold transition-all ${isLogin
                                ? 'bg-[#D26900] text-white'
                                : 'bg-n7 text-gray-400 hover:text-white'
                                }`}
                        >
                            登入
                        </button>
                        <button
                            onClick={() => {
                                setIsLogin(false);
                                setErrors({});
                            }}
                            className={`flex-1 py-2 rounded-xs cursor-pointer font-semibold transition-all ${!isLogin
                                ? 'bg-[#D26900] text-white'
                                : 'bg-n7 text-gray-400 hover:text-white'
                                }`}
                        >
                            註冊
                        </button>
                    </div>

                    {/* 錯誤訊息 */}
                    {errors.general && (
                        <div className={`mb-4 p-3 rounded-xs text-sm text-center ${errors.general.includes('成功')
                            ? 'bg-green-900/50 border border-green-700 text-green-300'
                            : 'bg-red-900/50 border border-red-700 text-red-300'
                            }`}>
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-gray-300 text-sm font-semibold mb-2">
                                    姓名 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    autoComplete="name"
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className={`w-full px-4 py-3 bg-n7 text-white rounded-xs focus:outline-none transition-all ${errors.name
                                        ? 'ring-2 ring-red-500'
                                        : 'focus:ring-2 focus:ring-[#D26900]'
                                        }`}
                                    placeholder="請輸入姓名"
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-300 text-sm font-semibold mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.email}
                                autoComplete="email"
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={`w-full px-4 py-3 bg-n7 text-white rounded-xs focus:outline-none transition-all ${errors.email
                                    ? 'ring-2 ring-red-500'
                                    : 'focus:ring-2 focus:ring-[#D26900]'
                                    }`}
                                placeholder={isLogin ? "請輸入已驗證的信箱" : "email@example.com"}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-semibold mb-2">
                                密碼 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className={`w-full px-4 py-3 bg-n7 text-white rounded-xs focus:outline-none transition-all ${errors.password
                                    ? 'ring-2 ring-red-500'
                                    : 'focus:ring-2 focus:ring-[#D26900]'
                                    }`}
                                placeholder={isLogin ? "請輸入密碼" : "請輸入至少 6 個字元"}
                            />
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-gray-300 text-sm font-semibold mb-2">
                                    電話
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    autoComplete="tel"
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className={`w-full px-4 py-3 bg-n7 text-white rounded-xs focus:outline-none transition-all ${errors.phone
                                        ? 'ring-2 ring-red-500'
                                        : 'focus:ring-2 focus:ring-[#D26900]'
                                        }`}
                                    placeholder="09xx-xxx-xxx（選填）"
                                />
                                {errors.phone && (
                                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="cursor-pointer w-full bg-primary hover:bg-[#B85700]  text-white py-3 rounded-xs font-medium text-l transition-all disabled:cursor-not-allowed mt-4"
                        >
                            {isLogin ? '登入' : '註冊'}
                        </button>
                    </form>

                    {/* 分隔線 */}
                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center  pt-2">
                        </div>
                    </div>
                    {/* 社群登入按鈕 */}
                    <div className="space-y-3 mt-6">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="cursor-pointer w-full bg-white hover:bg-gray-100 text-gray-800 py-3 px-4 rounded-xs font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            使用 Google 登入
                        </button>

                        <button
                            onClick={handleFacebookLogin}
                            disabled={loading}
                            className="cursor-pointer w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-3 px-4 rounded-xs font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            使用 Facebook 登入
                        </button>
                    </div>


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