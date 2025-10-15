'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface News {
  id: number;
  title: string;
  category: string;
  date: string;
  image?: string;
  excerpt: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    // 這裡之後可以從 API 獲取
    setNews([
      {
        id: 1,
        title: '春節檔期強檔鉅獻！10部必看電影搶先看',
        category: '活動消息',
        date: '2024-01-15',
        image: 'https://picsum.photos/400/300?random=1',
        excerpt: '春節連假即將到來，我們為您精選了10部必看強檔電影...'
      },
      {
        id: 2,
        title: 'IMAX廳全新升級！極致視聽震撼體驗',
        category: '影城公告',
        date: '2024-01-05',
        image: 'https://picsum.photos/400/300?random=3',
        excerpt: '本影城IMAX廳全面升級，帶來更震撼的觀影體驗...'
      },
    ]);
  }, []);

  return (
    <section className="bg-n9 py-16 mt-12">
      <div className="container mx-auto px-6">
        
        {/* 標題區 */}
        <div className="flex items-center justify-between mb-8 border-t border-n7">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 mt-8">最新消息</h2>
            <p className="text-gray-400">掌握最新優惠與活動資訊</p>
          </div>
          <Link 
            href="/news"
            className="text-[#D26900] hover:text-[#B85700] 
              transition-colors duration-300
              flex items-center gap-2 text-sm font-medium">
            查看更多
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 消息列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="group bg-n8  overflow-hidden
                border border-gray-800
                hover:border-[#D26900]
                transition-all duration-300
                hover:shadow-[0_0_30px_rgba(210,105,0,0.1)]">
              
              {/* 圖片 */}
              {item.image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover
                      transition-transform duration-500
                      group-hover:scale-110"
                  />
                  
                  {/* 分類標籤 */}
                  <div className="absolute top-3 left-3
                    bg-[#D26900] text-white
                    px-3 py-1 rounded text-xs font-medium">
                    {item.category}
                  </div>
                </div>
              )}

              {/* 內容 */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-2
                  line-clamp-2
                  group-hover:text-[#D26900]
                  transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {item.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.date}</span>
                  <span className="text-[#D26900] group-hover:translate-x-1 
                    transition-transform duration-300">
                    閱讀更多 →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}