'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ECPaySubmitContent() {
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);
    const params = Object.fromEntries(searchParams.entries());

    useEffect(() => {
        // 頁面載入後自動提交表單
        if (formRef.current) {
            formRef.current.submit();
        }
    }, []);

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
            <div className="text-center text-white">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D26900] mb-4"></div>
                <p className="text-xl">正在跳轉至付款頁面...</p>
                <p className="text-sm text-gray-400 mt-2">請稍候，不要關閉此頁面</p>
             
            </div>

            <form
                ref={formRef}
                action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
                method="post"
                style={{ display: 'none' }}
            >
                {Object.entries(params).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value as string} />
                ))}
            </form>
        </div>
    );
}

export default function ECPaySubmitPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="text-white">載入中...</div>
            </div>
        }>
            <ECPaySubmitContent />
        </Suspense>
    );
}