"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/services/api";
import PropertyCard from "./PropertyCard";
import PropertyCardSkeleton from "./PropertyCardSkeleton"; // <--- Yeni Import

// Backend-dən gələn DTO
interface House {
    id: number;
    title: string;
    address: string;
    price: number;
    numberOfRooms: number;
    numberOfBeds: number;
    coverImage: string;
    city: string;
}

export default function FeaturedProperties() {
    const [houses, setHouses] = useState<House[]>([]);
    const [loading, setLoading] = useState(true);

    // Şəkil URL-ni düzəltmək üçün
    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        if (path.startsWith("http")) return path;

        // MƏCBURİ HTTPS (Düzəliş)
        return `https://api.guventurizm.az/api/files/${path}`;
    };

    useEffect(() => {
        const fetchHouses = async () => {
            try {
                // Test üçün süni gecikmə (İstəsən silə bilərsən)
                // await new Promise(resolve => setTimeout(resolve, 2000));

                const response = await api.get("/Houses/active");
                // Ən son 3 evi götürürük
                const latestHouses = response.data.reverse().slice(0, 3);
                setHouses(latestHouses);
            } catch (error) {
                console.error("Evləri çəkmək mümkün olmadı:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHouses();
    }, []);

    // --- LOADING SKELETON ---
    if (loading) {
        return (
            <section className="py-20 bg-white dark:bg-black transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        {/* Başlıq Skeleti */}
                        <div className="h-10 w-64 bg-gray-100 dark:bg-zinc-800 rounded-lg mx-auto animate-pulse mb-4"></div>
                        <div className="h-4 w-96 bg-gray-50 dark:bg-zinc-800/50 rounded-lg mx-auto animate-pulse"></div>
                    </div>
                    {/* Kart Skeletləri (3 ədəd) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <PropertyCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (houses.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-white dark:bg-black transition-colors duration-300">
            <div className="container mx-auto px-4">

                {/* Bölmə Başlığı */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Ən Çox Bəyənilən <span className="text-primary">Evlərimiz</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Qonaqlarımız tərəfindən ən yüksək qiymət alan və tövsiyə edilən istirahət məkanları.
                    </p>
                </div>

                {/* Ev Kartları Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {houses.map((house) => (
                        <PropertyCard
                            key={house.id}
                            id={house.id}
                            title={house.title}
                            address={house.address}
                            price={house.price}
                            roomCount={house.numberOfRooms}
                            bedCount={house.numberOfBeds}
                            imageUrl={getImageUrl(house.coverImage)}
                        />
                    ))}
                </div>

                {/* "Hamısına Bax" Düyməsi */}
                <div className="text-center mt-12">
                    <Link
                        href="/houses"
                        className="inline-block px-8 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold rounded-full hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                    >
                        Bütün Evlərə Bax →
                    </Link>
                </div>

            </div>
        </section>
    );
}