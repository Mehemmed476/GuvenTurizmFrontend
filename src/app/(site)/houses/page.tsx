"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import api from "@/services/api";

// --- TİPLƏR (Backend DTO-larına uyğun) ---
interface Category {
    id: string;
    title: string;
}

interface Booking {
    startDate: string;
    endDate: string;
    status: number; // 0: Pending, 1: Confirmed, 2: Canceled
}

interface House {
    id: string; // Backend GUID göndərir
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

// --- MƏZMUN KOMPONENTİ ---
function HousesContent() {
    const searchParams = useSearchParams();

    // 1. URL-dən gələn parametrləri oxuyuruq
    const urlStartDate = searchParams.get("startDate");
    const urlEndDate = searchParams.get("endDate");
    const urlMinRooms = searchParams.get("minRooms");

    // 2. State-lər
    const [houses, setHouses] = useState<House[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtr State-ləri (URL-dən gələn və ya default)
    const [selectedCategory, setSelectedCategory] = useState("Hamısı");
    const [maxPrice, setMaxPrice] = useState(1000);
    const [minRooms, setMinRooms] = useState(urlMinRooms ? parseInt(urlMinRooms) : 1);

    // 3. API-dən dataları çək
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [housesRes, catsRes] = await Promise.all([
                    api.get("/Houses/active"),      // Bütün aktiv evləri çək
                    api.get("/Categories/active")   // Bütün aktiv kateqoriyaları çək
                ]);
                setHouses(housesRes.data);
                setCategories(catsRes.data);
            } catch (error) {
                console.error("Data xətası:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 4. ƏSAS FİLTRLƏMƏ MƏNTİQİ
    const filteredHouses = houses.filter((house) => {

        // A. Kateqoriya Filtri
        if (selectedCategory !== "Hamısı" && house.category?.title !== selectedCategory) {
            return false;
        }

        // B. Qiymət Filtri
        if (house.price > maxPrice) {
            return false;
        }

        // C. Otaq Sayı Filtri
        if (house.numberOfRooms < minRooms) {
            return false;
        }

        // D. TARİX FİLTRİ (Ən vacib hissə)
        // Əgər istifadəçi tarix seçibsə, dolu olan evləri gizlət
        if (urlStartDate && urlEndDate) {
            const start = new Date(urlStartDate);
            const end = new Date(urlEndDate);

            // Evin rezervasiyalarına baxırıq
            if (house.bookings && house.bookings.length > 0) {
                const isOccupied = house.bookings.some((booking) => {
                    // Ləğv edilmiş (Canceled) rezervasiyaları saymırıq (Status=2)
                    if (booking.status === 2) return false;

                    const bookingStart = new Date(booking.startDate);
                    const bookingEnd = new Date(booking.endDate);

                    // Tarix kəsişməsi (Overlap) məntiqi
                    return start < bookingEnd && end > bookingStart;
                });

                if (isOccupied) return false; // Ev doludursa, siyahıdan çıxar
            }
        }

        return true; // Bütün şərtləri keçdisə, evi göstər
    });

    // Şəkil URL-ni düzəltmək
    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
        return `${baseUrl}/api/files/${path}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* BAŞLIQ */}
            <div className="bg-gray-900 py-12 mb-10 relative">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-2">Bütün Evlərimiz</h1>
                    <p className="text-gray-300">
                        {urlStartDate ? "Seçdiyiniz tarixlərə uyğun evlər" : "Qubada istəyinizə uyğun ən yaxşı evləri seçin"}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- SOL TƏRƏF: FİLTRLƏR --- */}
                    <aside className="w-full lg:w-1/4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                Filtrlər
                            </h3>

                            {/* Kateqoriya */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-gray-700 mb-3">Ev Tipi</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Hamısı"
                                            checked={selectedCategory === "Hamısı"}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                        />
                                        <span className="text-gray-600 group-hover:text-primary transition-colors">Hamısı</span>
                                    </label>

                                    {categories.map((cat) => (
                                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat.title}
                                                checked={selectedCategory === cat.title}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                            />
                                            <span className="text-gray-600 group-hover:text-primary transition-colors">{cat.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Otaq Sayı */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-semibold text-gray-700">Minimum Otaq</h4>
                                    <span className="font-bold text-primary">{minRooms}</span>
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
                            </div>

                            {/* Qiymət */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-semibold text-gray-700">Maksimum Qiymət</h4>
                                    <span className="font-bold text-primary">{maxPrice} ₼</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="2000"
                                    step="50"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            {/* Təmizlə Butonu */}
                            <button
                                onClick={() => { setSelectedCategory("Hamısı"); setMaxPrice(2000); setMinRooms(1); }}
                                className="w-full py-2 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                Filtrləri Təmizlə
                            </button>
                        </div>
                    </aside>

                    {/* --- SAĞ TƏRƏF: EVLƏR (GRID) --- */}
                    <div className="w-full lg:w-3/4">

                        <div className="mb-6 flex justify-between items-center">
                            <p className="text-gray-500">
                                <span className="font-bold text-gray-900">{filteredHouses.length}</span> ev tapıldı
                            </p>
                        </div>

                        {loading ? (
                            <div className="text-center py-20">Yüklənir...</div>
                        ) : filteredHouses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredHouses.map((house) => (
                                    <PropertyCard
                                        key={house.id}
                                        id={house.id}
                                        title={house.title}
                                        address={house.address} // və ya house.city
                                        price={house.price}
                                        roomCount={house.numberOfRooms}
                                        bedCount={house.numberOfBeds}
                                        imageUrl={getImageUrl(house.coverImage)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                                <div className="text-6xl mb-4">🏠❌</div>
                                <h3 className="text-xl font-bold text-gray-800">Təəssüf ki, ev tapılmadı.</h3>
                                <p className="text-gray-500 mt-2">Zəhmət olmasa filtrləri dəyişdirib yenidən yoxlayın.</p>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}

// Next.js-də useSearchParams istifadə edəndə Suspense lazımdır
export default function HousesPage() {
    return (
        <Suspense fallback={<div>Yüklənir...</div>}>
            <HousesContent />
        </Suspense>
    );
}