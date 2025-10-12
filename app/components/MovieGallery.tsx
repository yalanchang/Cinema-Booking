'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Slide {
    id: number;
    image: string;
    title: string;
    description: string;
    link: string;
}

interface CarouselProps {
    slides: Slide[];
    autoPlayInterval?: number;
}

export default function MovieCarousel({ slides, autoPlayInterval = 5000 }: CarouselProps) {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);




    useEffect(() => {
        if (!isAutoPlay || slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isAutoPlay, slides.length, autoPlayInterval]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const getPrevIndex = () => {
        return (currentIndex - 1 + slides.length) % slides.length;
    };

    const getNextIndex = () => {
        return (currentIndex + 1) % slides.length;
    };

    if (slides.length === 0) return null;

    return (
        <div
            className="relative w-full h-[400px] bg-black overflow-hidden py-16 mb-8"
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
        >
            <div className="relative h-full flex items-center">
                {/* 左側圖片（模糊） */}
                <div className="absolute left-0 w-1/3 h-full overflow-hidden">
                    <div className="relative w-full h-full">
                        <img
                            src={slides[getPrevIndex()].image}
                            alt={slides[getPrevIndex()].title}
                            className="w-full h-full object-cover filter blur-sm scale-75 opacity-50"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>
                </div>

                {/* 中間圖片（清晰，無法點擊） */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-2/5 h-full overflow-hidden z-10">
                    <div className="relative w-full h-full group cursor-default">
                        <img
                            src={slides[currentIndex]?.image || 'https://via.placeholder.com/400x600'}
                            alt={slides[currentIndex]?.title || 'Placeholder'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* 右側圖片（模糊） */}
                <div className="absolute right-0 w-1/3 h-full overflow-hidden">
                    <div className="relative w-full h-full">
                        <img
                            src={slides[getNextIndex()].image}
                            alt={slides[getNextIndex()].title}
                            className="w-full h-full object-cover filter blur-sm scale-75 opacity-50"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>
                </div>
            </div>
            {/* 左右切換按鈕 */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all backdrop-blur-sm"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all backdrop-blur-sm"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* 指示點 */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${index === currentIndex
                            ? 'w-12 h-3 bg-primary'
                            : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}