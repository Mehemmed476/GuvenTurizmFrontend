"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import api from "@/services/api";
import PriceRangeSlider from "@/components/PriceRangeSlider";

// --- YERLİ TİPLƏR ---
interface Category {
    id: string;
    title: string;
}

interface Booking {
    startDate: string;
    endDate: string;
    status: number;
}

interface House {
    id: string;
    title: string;
    address: string;
    price: number;
    numberOfRooms: number;
    numberOfBeds: number;
    coverImage: string;
    categoryId: string;
    category?: Category;
    bookings?: Booking[];
    isDeleted: boolean;
}

function HousesContent() {
    const searchParams = useSearchParams();

    // URL parametrləri
    const urlStartDate = searchParams.get("startDate");
    const urlEndDate = searchParams.get("endDate");
    const urlMinRooms = searchParams.get("minRooms");

    // DATA STATE-ləri
    const [houses, setHouses] = useState<House[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // PAGINATION STATE-ləri
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // --- INPUT STATE-ləri (Kullanıcının değiştirdiği ama henüz uygulamadığı değerler) ---
    const [selectedCategory, setSelectedCategory] = useState("Hamısı");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(2000);
    const [minRooms, setMinRooms] = useState(urlMinRooms ? parseInt(urlMinRooms) : 1);

    // --- APPLIED STATE-ləri (Gerçekten filtrelemede kullanılan değerler) ---
    const [appliedCategory, setAppliedCategory] = useState("Hamısı");
    const [appliedMinPrice, setAppliedMinPrice] = useState(0);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState(2000);
    const [appliedMinRooms, setAppliedMinRooms] = useState(urlMinRooms ? parseInt(urlMinRooms) : 1);

    // İlk Yüklənmə
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [catsRes, housesRes] = await Promise.all([
                    api.get("/Categories/active"),
                    api.get(`/Houses/active?page=1&size=9`)
                ]);

                setCategories(catsRes.data);
                setHouses(housesRes.data);

                if (housesRes.data.length < 9) setHasMore(false);

            } catch (error) {
                console.error("Data xətası:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // "Daha Çox Yüklə" Funksiyası
    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);

        try {
            const nextPage = page + 1;
            const response = await api.get(`/Houses/active?page=${nextPage}&size=9`);

            if (response.data.length === 0) {
                setHasMore(false);
            } else {
                setHouses(prev => [...prev, ...response.data]);
                setPage(nextPage);
                if (response.data.length < 9) setHasMore(false);
            }
        } catch (error) {
            console.error("Yükləmə xətası:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // --- FİLTRLƏRİ TƏTBİQ ET (AXTAR BUTONU) ---
    const handleSearch = () => {
        setAppliedCategory(selectedCategory);
        setAppliedMinPrice(minPrice);
        setAppliedMaxPrice(maxPrice);
        setAppliedMinRooms(minRooms);

        // İsteğe bağlı: Axtar'a basınca sayfanın başına kaydır
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- FİLTRLƏRİ SIFIRLA ---
    const handleReset = () => {
        // Inputları sıfırla
        setSelectedCategory("Hamısı");
        setMinPrice(0);
        setMaxPrice(2000);
        setMinRooms(1);

        // Uygulanan filtreleri de sıfırla (Anında etki etsin diye)
        setAppliedCategory("Hamısı");
        setAppliedMinPrice(0);
        setAppliedMaxPrice(2000);
        setAppliedMinRooms(1);
    };

    // Filtrləmə Məntiqi (ARTIK APPLIED DEĞERLERİ KULLANIYOR)
    const filteredHouses = houses.filter((house) => {
        if (appliedCategory !== "Hamısı" && house.category?.title !== appliedCategory) return false;

        if (house.price < appliedMinPrice || house.price > appliedMaxPrice) return false;

        if (house.numberOfRooms < appliedMinRooms) return false;

        if (urlStartDate && urlEndDate) {
            const start = new Date(urlStartDate);
            const end = new Date(urlEndDate);
            if (house.bookings && house.bookings.length > 0) {
                const isOccupied = house.bookings.some((booking) => {
                    if (booking.status === 2) return false;
                    const bookingStart = new Date(booking.startDate);
                    const bookingEnd = new Date(booking.endDate);
                    return start < bookingEnd && end > bookingStart;
                });
                if (isOccupied) return false;
            }
        }
        return true;
    });

    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        if (path.startsWith("http")) return path;
        return `https://api.guventurizm.az/api/files/${path}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* BAŞLIQ */}
            <div className="bg-gray-900 py-12 mb-10 relative">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-2">Bütün Evlərimiz</h1>
                    <p className="text-gray-300">
                        Qubada ən yaxşı günlük evləri seçin
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- SOL TƏRƏF: FİLTRLƏR --- */}
                    <aside className="w-full lg:w-1/4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Filtrlər</h3>

                            {/* Kateqoriya */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-3">Ev Tipi</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="radio" name="category" value="Hamısı" checked={selectedCategory === "Hamısı"} onChange={(e) => setSelectedCategory(e.target.value)} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                                        <span className="text-gray-600 group-hover:text-primary transition-colors">Hamısı</span>
                                    </label>
                                    {categories.map((cat) => (
                                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="radio" name="category" value={cat.title} checked={selectedCategory === cat.title} onChange={(e) => setSelectedCategory(e.target.value)} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                                            <span className="text-gray-600 group-hover:text-primary transition-colors">{cat.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Otaq Sayı */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-gray-700 mb-3">Otaq Sayı</h4>
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => setMinRooms(1)}
                                        className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border ${minRooms === 1
                                                ? "bg-primary text-white border-primary shadow-md"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        Hamısı
                                    </button>

                                    <div className={`transition-opacity duration-300 ${minRooms === 1 ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}>
                                        <div className="flex justify-between mb-2 text-xs font-medium text-gray-500">
                                            <span>Min. Limit</span>
                                            <span className="text-gray-900 font-bold">{minRooms} Otaq</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            step="1"
                                            value={minRooms}
                                            onChange={(e) => setMinRooms(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                            <span>1</span>
                                            <span>10+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Qiymət Aralığı */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-gray-700 mb-2">Qiymət Aralığı</h4>
                                <PriceRangeSlider
                                    min={0}
                                    max={2000}
                                    initialMin={minPrice}
                                    initialMax={maxPrice}
                                    onChange={(min, max) => {
                                        setMinPrice(min);
                                        setMaxPrice(max);
                                    }}
                                />
                            </div>

                            {/* --- BUTONLAR --- */}
                            <div className="flex flex-col gap-3 mt-4">
                                {/* Axtar Butonu */}
                                <button
                                    onClick={handleSearch}
                                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95"
                                >
                                    Axtar
                                </button>

                                {/* Reset Butonu */}
                                <button
                                    onClick={handleReset}
                                    className="w-full py-3 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200"
                                >
                                    Filtrləri Təmizlə
                                </button>
                            </div>

                        </div>
                    </aside>

                    {/* --- SAĞ TƏRƏF: EVLƏR --- */}
                    <div className="w-full lg:w-3/4">
                        <div className="mb-6 flex justify-between items-center">
                            <p className="text-gray-500">
                                <span className="font-bold text-gray-900">{filteredHouses.length}</span> ev tapıldı
                            </p>

                            {/* Küçük bir bilgilendirme (Mobil için faydalı olabilir) */}
                            {filteredHouses.length === 0 && (
                                <span className="text-sm text-red-500 font-medium">Heç bir nəticə yoxdur</span>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => <PropertyCardSkeleton key={i} />)}
                            </div>
                        ) : filteredHouses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredHouses.map((house) => (
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

                                {/* DAHA ÇOX YÜKLƏ DÜYMƏSİ */}
                                {hasMore && (
                                    <div className="mt-10 text-center">
                                        <button
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                                    Yüklənir...
                                                </>
                                            ) : (
                                                "Daha Çox Göstər"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                                <div className="text-6xl mb-4">🏠❌</div>
                                <h3 className="text-xl font-bold text-gray-800">Ev Tapılmadı</h3>
                                <p className="text-gray-500 mt-2">Zəhmət olmasa filtrləri dəyişib "Axtar" düyməsinə basın.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function HousesPage() {
    return (
        <Suspense fallback={<div>Yüklənir...</div>}>
            <HousesContent />
        </Suspense>
    );
}