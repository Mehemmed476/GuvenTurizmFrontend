"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/services/api"; // Senin api.ts dosyanı kullanıyoruz
import TourCard from "./TourCard";

// Backend'den gələn Tur datası üçün interfeys
interface Tour {
    id: string;
    title: string;
    location: string;
    durationDay: number;
    durationNight: number;
    imageUrls: string[];
    packages: { price: number; discountPrice?: number }[]; // Qiyməti paketdən alacağıq
}

export default function NewestTours() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);

    // Resim URL Düzeltici (FeaturedProperties'deki mantığın aynısı)
    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        if (path.startsWith("http")) return path;
        // Backend'deki resim yoluna yönlendiriyoruz
        return `https://api.guventurizm.az/api/files/${path}`;
    };

    useEffect(() => {
        const fetchTours = async () => {
            try {
                // Backend endpoint: GET /api/Tours?page=1&size=3
                const response = await api.get("/Tours", {
                    params: { page: 1, size: 3 }
                });
                setTours(response.data);
            } catch (error) {
                console.error("Turları çəkmək mümkün olmadı:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    // Yüklenirken veya Veri Yoksa Gösterme
    if (loading) {
        // İstersen buraya Skeleton ekleyebilirsin, şimdilik boş dönüyorum
        return <div className="py-20 text-center text-gray-400">Yüklənir...</div>;
    }

    if (tours.length === 0) return null;

    return (
        <section className="py-20 bg-blue-50/50"> {/* Arxa fonu bir az fərqli etdik */}
            <div className="container mx-auto px-4">

                {/* Başlıq */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div className="text-center md:text-left w-full md:w-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                            Yeni <span className="text-blue-600">Turlarımız</span>
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Sizin üçün hazırladığımız ən son səyahət paketləri.
                        </p>
                    </div>

                    {/* Masaüstü üçün Link */}
                    <Link href="/tours" className="hidden md:inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition">
                        Bütün Turlara Bax <span className="ml-2 text-xl">→</span>
                    </Link>
                </div>

                {/* Turlar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tours.map((tour) => {
                        // Ən ucuz paketin qiymətini tapırıq
                        const minPrice = tour.packages?.length > 0
                            ? Math.min(...tour.packages.map(p => p.discountPrice || p.price))
                            : 0;

                        return (
                            <TourCard
                                key={tour.id}
                                id={tour.id}
                                title={tour.title}
                                location={tour.location}
                                durationDay={tour.durationDay}
                                durationNight={tour.durationNight}
                                price={minPrice}
                                imageUrl={getImageUrl(tour.imageUrls?.[0])}
                            />
                        );
                    })}
                </div>

                {/* Mobil üçün Link (Aşağıda) */}
                <div className="text-center mt-12 md:hidden">
                    <Link
                        href="/tours"
                        className="inline-block px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all"
                    >
                        Bütün Turlara Bax →
                    </Link>
                </div>

            </div>
        </section>
    );
}