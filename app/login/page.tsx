'use client';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
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
                const errorMessage = result.error || '操作失敗';
                if (errorMessage.includes('Email')) {
                    setErrors({ email: errorMessage });
                } else if (errorMessage.includes('密碼')) {
                    setErrors({ password: errorMessage });
                } else if (errorMessage.includes('必填欄位')) {
                    setErrors({ general: errorMessage });
                } else {
                    setErrors({ general: '網路錯誤，請稍後再試' });
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

                {/* 表單 */}
                <div className=" p-8 ">
                    {/* 切換登入/註冊 */}
                    <div className="flex gap-4 mb-6 ">
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

                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-900/50 rounded-xs text-red-300 text-sm text-center">
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
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-n7 text-white rounded-xs focus:outline-none focus:ring-2 focus:ring-[#D26900]"
                                    placeholder="請輸入姓名"
                                />
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
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-n7 text-white rounded-xs focus:outline-none focus:ring-2 focus:ring-[#D26900]"
                                placeholder="請輸入信箱"
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
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 bg-n7 text-white rounded-xs focus:outline-none focus:ring-2 focus:ring-[#D26900]"
                                placeholder="至少 6 個字元"
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
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-n7 text-white rounded-xs focus:outline-none focus:ring-2 focus:ring-[#D26900]"
                                    placeholder="09xx-xxx-xxx"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-[#B85700] disabled:bg-gray-600 text-white py-3 rounded-xs font-medium text-l transition-all disabled:cursor-not-allowed mt-4"
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