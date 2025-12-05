"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BookingForm from "@/components/BookingForm";
import api from "@/services/api";
import ReviewSection from "@/components/ReviewSection"; // <--- Yeni komponent
import Skeleton from "@/components/Skeleton"; // Əgər varsa

// --- DTO TİPLƏRİ ---
interface HouseAdvantageRel {
    houseAdvantage: {
        title: string;
    };
}

interface HouseFile {
    image: string;
}

interface Booking {
    startDate: string;
    endDate: string;
    status: number;
}

interface HouseDetail {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    price: number;
    numberOfRooms: number;
    numberOfBeds: number;
    field: number;
    googleMapsCode: string;
    coverImage: string;
    images: HouseFile[];
    houseHouseAdvantageRels: HouseAdvantageRel[];
    bookings: Booking[];
}

export default function HouseDetailClient({ id }: { id: string }) {
    const [house, setHouse] = useState<HouseDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Qalereya State-ləri
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // --- API-DƏN MƏLUMATI ÇƏK ---
    useEffect(() => {
        const fetchHouse = async () => {
            try {
                const response = await api.get(`/Houses/${id}`);
                setHouse(response.data);
            } catch (error) {
                console.error("Ev tapılmadı:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchHouse();
    }, [id]);

    // --- HELPER: ŞƏKİL URL ---
    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        if (path.startsWith("http")) return path;

        // MƏCBURİ HTTPS (Düzəliş)
        return `https://api.guventurizm.az/api/files/${path}`;
    };

    // --- HELPER: QALEREYA ŞƏKİLLƏRİ ---
    const galleryImages = house
        ? [house.coverImage, ...house.images.map(img => img.image)]
        : [];

    // --- QALEREYA FUNKSİYALARI ---
    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setIsGalleryOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
        document.body.style.overflow = 'unset';
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    if (loading) return (
        <div className="min-h-screen bg-white pb-20 pt-6">
            <div className="container mx-auto px-4">
                {/* Skeleton loading */}
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
                    <div className="h-[400px] bg-gray-200 rounded-3xl"></div>
                    <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 h-64 bg-gray-200 rounded-xl"></div>
                        <div className="col-span-1 h-64 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!house) return <div className="py-40 text-center text-red-500">Ev tapılmadı.</div>;

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 pt-6">

                {/* --- BAŞLIQ --- */}
                <div className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                        {house.title}
                    </h1>
                    <p className="text-gray-500 underline flex items-center gap-1">
                        <span>📍 {house.address || house.city}</span>
                    </p>
                </div>

                {/* --- ŞƏKİL QALEREYASI (GRID) --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-10">
                    {/* Cover */}
                    <div
                        onClick={() => openGallery(0)}
                        className="md:col-span-2 h-full relative group cursor-pointer"
                    >
                        <Image
                            src={getImageUrl(house.coverImage)}
                            alt="Main"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors flex items-center justify-center z-10">
                            <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-4 py-2 rounded-full text-sm transition-opacity">Böyüt</span>
                        </div>
                    </div>

                    {/* Digər Şəkillər */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 h-full">
                        {house.images.slice(0, 4).map((imgObj, index) => (
                            <div
                                key={index}
                                onClick={() => openGallery(index + 1)}
                                className="relative group cursor-pointer overflow-hidden h-full"
                            >
                                <Image
                                    src={getImageUrl(imgObj.image)}
                                    alt={`Gallery ${index}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- ƏSAS MƏZMUN --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* SOL TƏRƏF: Detallar */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* İkonlar */}
                        <div className="flex flex-wrap gap-6 pb-8 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 rounded-xl text-primary">🛏️</div>
                                <div><p className="font-bold text-gray-900">{house.numberOfRooms} Otaq</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 rounded-xl text-primary">💤</div>
                                <div><p className="font-bold text-gray-900">{house.numberOfBeds} Yataq</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 rounded-xl text-primary">📏</div>
                                <div><p className="font-bold text-gray-900">{house.field} m²</p></div>
                            </div>
                        </div>

                        {/* Təsvir */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ev Haqqında</h2>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                {house.description}
                            </p>
                        </div>

                        {/* Üstünlüklər */}
                        {house.houseHouseAdvantageRels && house.houseHouseAdvantageRels.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Nələr Təklif Edirik?</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {house.houseHouseAdvantageRels.map((rel, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                                            <span className="text-primary text-xl">✓</span>
                                            <span className="text-gray-700 font-medium">{rel.houseAdvantage.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Xəritə */}
                        {house.googleMapsCode && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ünvan</h2>
                                <div
                                    className="h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-200 [&_iframe]:w-full [&_iframe]:h-full"
                                    dangerouslySetInnerHTML={{ __html: house.googleMapsCode }}
                                />
                            </div>
                        )}

                        {/* --- RƏYLƏR BÖLMƏSİ (Bura əlavə edildi) --- */}
                        <ReviewSection houseId={house.id} />

                    </div>

                    {/* SAĞ TƏRƏF: Booking Form */}
                    <div className="lg:col-span-1">
                        <BookingForm
                            houseId={house.id}
                            price={house.price}
                            existingBookings={house.bookings || []}
                        />
                    </div>
                </div>
            </div>

            {/* --- FULL SCREEN MODAL (LIGHTBOX) --- */}
            {isGalleryOpen && (
                <div
                    className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
                    onClick={closeGallery}
                >
                    <button onClick={closeGallery} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-50">✕</button>

                    <button onClick={prevImage} className="absolute left-4 md:left-10 text-white/70 hover:text-white p-3 text-4xl z-50">‹</button>

                    <div className="relative max-w-5xl w-full h-[80vh]">
                        <Image
                            src={getImageUrl(galleryImages[currentImageIndex])}
                            alt="Full Screen"
                            fill
                            className="object-contain"
                            onClick={(e) => e.stopPropagation()}
                            quality={90}
                            sizes="100vw"
                        />
                    </div>

                    <div className="absolute bottom-10 text-white text-lg font-medium z-20">
                        {currentImageIndex + 1} / {galleryImages.length}
                    </div>

                    <button onClick={nextImage} className="absolute right-4 md:right-10 text-white/70 hover:text-white p-3 text-4xl z-50">›</button>
                </div>
            )}

        </div>
    );
}