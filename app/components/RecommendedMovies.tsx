'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Movie {
    id: number;
    title: string;
    poster_url: string;
    rating: string;
    genre: string;
}

interface RecommendedMoviesProps {
    currentMovieId: string;
}

export default function RecommendedMovies({ currentMovieId }: RecommendedMoviesProps) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendedMovies();
    }, [currentMovieId]);

    const fetchRecommendedMovies = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/movies');
            const result = await response.json();

            if (result.success) {
                // 獲取當前電影
                const currentMovie = result.data.find((m: Movie) => m.id.toString() === currentMovieId);

                if (currentMovie) {
                    // 優先推薦同類型電影
                    const currentGenres = currentMovie.genre.split('/').map((g: string) => g.trim());

                    const filtered = result.data
                        .filter((movie: Movie) => movie.id.toString() !== currentMovieId)
                        .map((movie: Movie) => {
                            // 計算類型相似度
                            const movieGenres = movie.genre.split('/').map((g: string) => g.trim());
                            const similarity = movieGenres.filter((g: string) => currentGenres.includes(g)).length;
                            return { ...movie, similarity };
                        })
                        .sort((a: any, b: any) => b.similarity - a.similarity) // 按相似度排序
                        .slice(0, 6);

                    setMovies(filtered);
                } else {
                    // 如果找不到當前電影，就隨機推薦
                    const filtered = result.data
                        .filter((movie: Movie) => movie.id.toString() !== currentMovieId)
                        .slice(0, 6);
                    setMovies(filtered);
                }
            }
        } catch (error) {
            console.error('Error fetching recommended movies:', error);
        } finally {
            setLoading(false);
        }
    };



    if (movies.length === 0) {
        return null;
    }

    return (
        <section className="w-full bg-black py-16">
            <div className="container mx-auto ">
                {/* 標題 */}
                <div className="flex items-center justify-center gap-4 mb-8 py-8 pt-16">
                    <h2 className="text-3xl text-white ">推薦電影</h2>
                </div>

                {/* 電影網格 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
                    {movies.map((movie) => (
                        <Link
                            href={`/movies/${movie.id}`}
                            key={movie.id}
                            className="group cursor-pointer transform transition-all duration-300 ease-out hover:scale-105"
                        >
                            {/* 電影海報 */}
                            <div className="relative aspect-[2/3] overflow-hidden mb-3 shadow-xl ">
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-full h-full object-cover  "
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/300x450/1f2937/ffffff?text=' + encodeURIComponent(movie.title);
                                    }}
                                />


                                {/* 評分標籤 */}
                                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {movie.rating}
                                </div>
                            </div>

                            {/* 電影資訊 */}
                            <div className="">
                                <h3 className="text-white font-bold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                    {movie.title}
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {movie.genre.split('/').slice(0, 2).map((g, i) => (
                                        <span key={i} className="text-xs text-gray-400 
">
                                            {g.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 查看更多按鈕 */}
                <div className="text-center mt-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/80 text-white font-semibold transition-all shadow-lg "
                    >
                        查看更多電影
                    </Link>
                </div>
            </div>
        </section>
    );
}