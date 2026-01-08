"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import TourCard from "@/components/TourCard";
import PriceRangeSlider from "@/components/PriceRangeSlider"; // Evlərdəki komponent
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

// --- TİP TANIMLAMALARI ---
interface Tour {
    id: string;
    title: string;
    location: string;
    durationDay: number;
    durationNight: number;
    imageUrls: string[];
    packages: { price: number; discountPrice?: number }[];
}

export default function ToursPage() {
    // API-dən gələn əsas data
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);

    // --- FORM STATE (İstifadəçinin seçdiyi, amma hələ "Axtar" demədiyi dəyərlər) ---
    const [tempSearchTerm, setTempSearchTerm] = useState("");
    const [tempMinPrice, setTempMinPrice] = useState<number>(0);
    const [tempMaxPrice, setTempMaxPrice] = useState<number>(1000);
    const [tempMinDays, setTempMinDays] = useState<number | null>(null); // null = "Hamısı"

    // --- RESİM URL DÜZELTİCİ ---
    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        if (path.startsWith("http")) return path;
        return `https://api.guventurizm.az/api/files/${path}`;
    };

    // --- VERİ ÇEKME ---
    useEffect(() => {
        const fetchTours = async () => {
            try {
                setLoading(true);
                // Bütün turları çəkirik
                const response = await api.get("/Tours", {
                    params: { page: 1, size: 100 }
                });
                setAllTours(response.data);
                setFilteredTours(response.data); // İlkin olaraq hamısını göstər
            } catch (error) {
                console.error("Turlar yüklenirken xəta:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    // --- FİLTRLƏMƏ FUNKSİYASI ("Axtar" düyməsinə basanda işləyir) ---
    const handleFilter = () => {
        const results = allTours.filter((tour) => {
            // 1. Axtarış (Ad və ya Məkan)
            const searchLower = tempSearchTerm.toLowerCase();
            const matchesSearch =
                tour.title.toLowerCase().includes(searchLower) ||
                tour.location.toLowerCase().includes(searchLower);

            // 2. Qiymət (Ən aşağı paket qiymətinə görə)
            const tourMinPrice = tour.packages?.length > 0
                ? Math.min(...tour.packages.map(p => p.discountPrice || p.price))
                : 0;

            const matchesPrice = tourMinPrice >= tempMinPrice && tourMinPrice <= tempMaxPrice;

            // 3. Gün Sayısı (null isə hamısı)
            const matchesDays = tempMinDays === null || tour.durationDay >= tempMinDays;

            return matchesSearch && matchesPrice && matchesDays;
        });

        setFilteredTours(results);

        // Mobil üçün səhifəni yuxarı sürüşdür (opsional)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filtrləri təmizləmək
    const clearFilters = () => {
        setTempSearchTerm("");
        setTempMinPrice(0);
        setTempMaxPrice(1000);
        setTempMinDays(null);
        setFilteredTours(allTours);
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* --- BAŞLIQ (Evlərimiz səhifəsi ilə eyni sadəlikdə) --- */}
            <div className="bg-gray-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        Turlarımız
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Xəyalınızdaki səyahəti bizimlə gerçəkləşdirin.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- SIDEBAR FİLTRE (SOL) --- */}
                    <aside className="w-full lg:w-1/4">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                <FunnelIcon className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-gray-900 text-lg">Filtrlər</h3>
                            </div>

                            {/* Axtarış Inputu */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Axtarış</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tur adı və ya şəhər..."
                                        value={tempSearchTerm}
                                        onChange={(e) => setTempSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                                </div>
                            </div>

                            {/* Qiymət Slideri (Evlərimizdəki kimi) */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-4">Qiymət Aralığı (AZN)</label>
                                <PriceRangeSlider
                                    min={0}
                                    max={1000}
                                    onChange={(min, max) => {
                                        setTempMinPrice(min);
                                        setTempMaxPrice(max);
                                    }}
                                />
                            </div>

                            {/* Gün Sayısı (Hamısı Buttonu ilə) */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Müddət (Gün)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setTempMinDays(null)}
                                        className={`py-2 text-sm font-medium rounded-lg transition-all ${tempMinDays === null
                                            ? "bg-primary text-white shadow-md"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        Hamısı
                                    </button>
                                    {[1, 3, 5, 7, 10].map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => setTempMinDays(day)}
                                            className={`py-2 text-sm font-medium rounded-lg transition-all ${tempMinDays === day
                                                ? "bg-primary text-white shadow-md"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {day}+ Gün
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* BUTTONLAR */}
                            <div className="flex flex-col gap-3">
                                {/* AXTAR BUTTONU - ƏSAS FİLTRLƏMƏ BURADA OLUR */}
                                <button
                                    onClick={handleFilter}
                                    className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    Axtar
                                </button>

                                <button
                                    onClick={clearFilters}
                                    className="w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    Filtrləri Təmizlə
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* --- LİSTELEME ALANI (SAĞ) --- */}
                    <div className="w-full lg:w-3/4">
                        {/* Nəticə Başlığı */}
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Səyahət Paketləri
                            </h2>
                            <span className="text-sm bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-medium">
                                {filteredTours.length} nəticə
                            </span>
                        </div>

                        {/* Loading Skeleton */}
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="bg-white rounded-2xl h-[380px] animate-pulse shadow-sm border border-gray-100" />
                                ))}
                            </div>
                        )}

                        {/* Nəticə Yoxdursa */}
                        {!loading && filteredTours.length === 0 && (
                            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Nəticə tapılmadı</h3>
                                <p className="text-gray-500">
                                    Axtarışınıza uyğun tur mövcud deyil. Filtrləri dəyişərək yenidən cəhd edin.
                                </p>
                            </div>
                        )}

                        {/* Kartlar Grid */}
                        {!loading && filteredTours.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredTours.map((tour) => {
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
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}