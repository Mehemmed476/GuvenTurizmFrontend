"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import api from "@/services/api";

// --- YERLİ TİPLƏR (Heç yerə daşımırıq) ---
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
    const [hasMore, setHasMore] = useState(true); // Daha çox ev varmı?
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); // "Daha çox" düyməsi üçün

    // FILTER STATE-ləri
    const [selectedCategory, setSelectedCategory] = useState("Hamısı");
    const [maxPrice, setMaxPrice] = useState(1000);
    const [minRooms, setMinRooms] = useState(urlMinRooms ? parseInt(urlMinRooms) : 1);

    // İlk Yüklənmə (Kateqoriyalar və İlk Səhifə)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Səhifə 1-i və kateqoriyaları yükləyirik
                const [catsRes, housesRes] = await Promise.all([
                    api.get("/Categories/active"),
                    api.get(`/Houses/active?page=1&size=9`)
                ]);

                setCategories(catsRes.data);
                setHouses(housesRes.data);

                // Əgər gələn data 9-dan azdırsa, deməli son səhifədir
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
                // Yeni evləri köhnələrin sonuna əlavə et
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

    // Filtrləmə Məntiqi
    const filteredHouses = houses.filter((house) => {
        if (selectedCategory !== "Hamısı" && house.category?.title !== selectedCategory) return false;
        if (house.price > maxPrice) return false;
        if (house.numberOfRooms < minRooms) return false;

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
        
        // Burayı düzelttik:
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

                            {/* Digər filtrlər... */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-semibold text-gray-700">Min. Otaq</h4>
                                    <span className="font-bold text-primary">{minRooms}</span>
                                </div>
                                <input type="range" min="1" max="10" step="1" value={minRooms} onChange={(e) => setMinRooms(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-semibold text-gray-700">Maks. Qiymət</h4>
                                    <span className="font-bold text-primary">{maxPrice} ₼</span>
                                </div>
                                <input type="range" min="50" max="2000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>

                            <button onClick={() => { setSelectedCategory("Hamısı"); setMaxPrice(2000); setMinRooms(1); }} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors border border-gray-200 rounded-lg">Filtrləri Təmizlə</button>
                        </div>
                    </aside>

                    {/* --- SAĞ TƏRƏF: EVLƏR --- */}
                    <div className="w-full lg:w-3/4">
                        <div className="mb-6">
                            <p className="text-gray-500">
                                <span className="font-bold text-gray-900">{filteredHouses.length}</span> ev göstərilir
                            </p>
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
                                <p className="text-gray-500 mt-2">Filtrləri dəyişərək yenidən yoxlayın.</p>
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
