"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/services/api";
import PropertyCard from "./PropertyCard";

// Backend-dən gələn DTO
interface House {
    id: number; // və ya string (Backend GUID göndərir, amma PropertyCard uyğunlaşmalıdır)
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

    // Şəkil URL-ni düzəltmək üçün (Backend fayl adını verir, biz tam yol düzəldirik)
    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
        return `${baseUrl}/api/files/${path}`;
    };

    useEffect(() => {
        const fetchHouses = async () => {
            try {
                // Backend: [HttpGet("active")] (Hər kəs görə bilər)
                const response = await api.get("/Houses/active");
                // Sadəcə ilk 3 evi götürək (Və ya ən son əlavə olunanları)
                // Reverse edib son əlavə olunanları başa gətirə bilərik
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

    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-500">Evlər yüklənir...</p>
            </div>
        );
    }

    if (houses.length === 0) {
        return null; // Ev yoxdursa bu bölməni göstərmə
    }

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">

                {/* Bölmə Başlığı */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        Ən Çox Bəyənilən <span className="text-primary">Evlərimiz</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
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
                            address={house.address} // Və ya house.city
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
                        className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-all"
                    >
                        Bütün Evlərə Bax →
                    </Link>
                </div>

            </div>
        </section>
    );
}