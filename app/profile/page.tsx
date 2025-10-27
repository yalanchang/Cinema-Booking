'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';


export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gender: '',
        birthdate: '',
        address: '',
        city: '',
        district: '',
        zip_code: '',
        newsletter: false,
        sms_notification: false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);




    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // 初始化表單數據
    useEffect(() => {
        if (session?.user && !isInitialized) {
            let birthdate = (session.user as any).birthdate || '';
            if (birthdate) {
                if (typeof birthdate === 'string' && birthdate.includes('T')) {
                    birthdate = birthdate.split('T')[0];
                } else if (birthdate instanceof Date) {
                    birthdate = birthdate.toISOString().split('T')[0];
                }
            }
            setFormData({
                name: session.user.name || '',
                phone: session.user.phone || '',
                gender: (session.user as any).gender || '',
                birthdate: birthdate || '',
                address: (session.user as any).address || '',
                city: (session.user as any).city || '',
                district: (session.user as any).district || '',
                zip_code: (session.user as any).zip_code || '',
                sms_notification: (session.user as any).sms_notification || '',
                newsletter: (session.user as any).newsletter || '',

            });
            setIsInitialized(true);
        }
    }, [session, isInitialized]);

    if (status === 'loading') {
        return (
            <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-neutral-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (!session || !session.user) {
        return null;
    }

    const user = session.user;

    // 處理輸入變化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        setMessage({ type: '', text: '' });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 文件類型
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: '請選擇圖片' });
                return;
            }

            // 文件大小（限制 5MB）
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: '圖片大小不能超過 5MB' });
                return;
            }

            setAvatarFile(file);

            // 預覽圖片
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    // 處理保存
    const handleSave = async () => {
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: '名字不能為空' });
            return;
        }

        setIsSaving(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('phone', formData.phone ? formData.phone.trim() : '');
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('birthdate', formData.birthdate);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('district', formData.district);
            formDataToSend.append('zipCode', formData.zip_code);

            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile as File);
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '更新失敗');
            }

            setMessage({ type: 'success', text: '個人資訊已更新' });

            const birthdate = formData.birthdate ? formData.birthdate : (data.user.birthdate?.split('T')[0] || '');
            const gender = formData.gender || data.user.gender || '';

            console.log('更新數據:', { gender, birthdate });  // ← 調試用

            await updateSession({
                user: {
                    ...session?.user,
                    name: formData.name,
                    phone: formData.phone,
                    gender: gender,
                    birthdate: birthdate,
                    address: formData.address,
                    city: formData.city,
                    district: formData.district,
                    zip_code: formData.zip_code,
                    image: data.user.avatar || session?.user?.image,
                },
            });

            setAvatarFile(null);
            setIsInitialized(false);
            setIsEditing(false);

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 2000);

        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : '更新失敗，請重試',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // 取消編輯
    const handleCancel = () => {
        let birthdate = (user as any).birthdate || '';
        if (birthdate) {
            if (typeof birthdate === 'string' && birthdate.includes('T')) {
                birthdate = birthdate.split('T')[0];
            } else if (birthdate instanceof Date) {
                birthdate = birthdate.toISOString().split('T')[0];
            }
        }
        setFormData({
            name: user.name || '',
            phone: (user as any).phone || '',
            gender: (user as any).gender || '',
            birthdate: (user as any).birthdate || '',
            address: (user as any).address || '',
            city: (user as any).city || '',
            district: (user as any).district || '',
            zip_code: (user as any).zip_code || '',
            newsletter: Boolean((user as any).newsletter),
            sms_notification: Boolean((user as any).sms_notification),
        });
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="min-h-screen bg-neutral-900 ">
            {/* Header */}
            <header className="text-white p-6 shadow-2xl border-b border-gray-800">
                <div className="container mx-auto">
                    <Link href="/" className="text-gray-400 hover:text-white">
                        返回首頁
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {/* 消息提示 */}
                    {message.text && (
                        <div
                            className={`mb-6 p-4 rounded-xs ${message.type === 'success'
                                ? 'bg-green-900 text-green-100'
                                : 'bg-red-900 text-red-100'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* 個人資訊卡片 */}
                    <div className="bg-n8 rounded-xs p-8 shadow-xl mb-6">
                        <div className="flex items-center gap-6 mb-6">
                            {/* 頭像 */}
                            {!isEditing ? (
                                // 非編輯模式的頭像
                                <>
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
                                </>
                            ) : (
                                // 編輯模式的頭像 
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="預覽"
                                            className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-[#D26900] flex items-center justify-center text-white text-4xl font-bold cursor-pointer hover:opacity-80">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}

                                    {/* 上傳按鈕 */}
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('avatar-input')?.click()}
                                        className="absolute bottom-0 right-0 bg-[#D26900] rounded-full p-2 hover:bg-[#C25A00] transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>

                                    {/* 隱藏的 input */}
                                    <input
                                        id="avatar-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col ">
                            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                            {/* 登入方式 */}
                            {user.provider && (
                                <div className="mt-4">
                                    <span className="inline-flex items-center gap-2 text-xs text-gray-300">
                                        {user.provider === 'google' && (
                                            <>
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path
                                                        fill="#4285F4"
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    />
                                                    <path
                                                        fill="#34A853"
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    />
                                                    <path
                                                        fill="#FBBC05"
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    />
                                                    <path
                                                        fill="#EA4335"
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    />
                                                </svg>
                                                Google 帳號
                                            </>
                                        )}
                                        {user.provider === 'facebook' && (
                                            <>
                                                <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">帳號資訊</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-[#D26900] hover:bg-[#C25A00] text-white rounded-xs transition-colors cursor-pointer text-sm"
                                    >
                                        編輯
                                    </button>
                                )}
                            </div>

                            {message.type && (
                                <div className={`mb-4 p-3 rounded text-white text-sm ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">會員編號</p>
                                    <p className="text-white font-semibold">#{user.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Email</p>
                                    <p className="text-white font-semibold">{user.email}</p>
                                </div>

                                {isEditing ? (
                                    <>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">電話</p>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-neutral-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#D26900]"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">性別</p>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-neutral-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#D26900]"
                                            >
                                                <option value="">請選擇</option>
                                                <option value="male">男性</option>
                                                <option value="female">女性</option>
                                                <option value="other">其他</option>
                                                <option value="prefer_not_to_say">不願透露</option>
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">生日</p>
                                            <input
                                                type="date"
                                                name="birthdate"
                                                value={formData.birthdate}
                                                onChange={handleInputChange}
                                                style={{ colorScheme: 'dark' }}
                                                className="w-full px-3 py-2 bg-neutral-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#D26900]"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">地址</p>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-neutral-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#D26900]"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">城市</p>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-neutral-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#D26900]"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">區</p>
                                            <input
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-neutral-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#D26900]"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">郵編</p>
                                            <input
                                                type="text"
                                                name="zip_code"
                                                value={formData.zip_code}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-neutral-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#D26900]"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">電話</p>
                                            <p className="text-white font-semibold">{formData.phone || '未設定'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">性別</p>
                                            <p className="text-white font-semibold">{formData.gender || '未設定'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">生日</p>
                                            <p className="text-white font-semibold">{formData.birthdate || '未設定'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">地址</p>
                                            <p className="text-white font-semibold">{formData.address || '未設定'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">城市</p>
                                            <p className="text-white font-semibold">{formData.city || '未設定'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">區</p>
                                            <p className="text-white font-semibold">{formData.district || '未設定'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm mb-1">郵編</p>
                                            <p className="text-white font-semibold">{formData.zip_code || '未設定'}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 保存/取消按鈕 */}
                            {isEditing && (
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-[#D26900] hover:bg-[#C25A00] disabled:bg-gray-600 text-white rounded-xs transition-colors cursor-pointer"
                                    >
                                        保存
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-n6 hover:bg-n5 disabled:bg-gray-600 text-white rounded-xs transition-colors cursor-pointer"
                                    >
                                        取消
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 功能選單 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            href="/profile/orders"
                            className="bg-n8 hover:bg-n7 rounded-xs p-6 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#D26900] flex items-center justify-center text-white transition-transform">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                        />
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
                            className="bg-n8 hover:bg-n7 rounded-xs p-6 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#D26900] flex items-center justify-center text-white transition-transform">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                        />
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