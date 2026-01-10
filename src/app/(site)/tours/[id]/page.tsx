"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import api from "@/services/api";
import {
    MapPinIcon,
    ClockIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

// --- TİP TANIMLAMALARI ---
interface TourPackage {
    id: string;
    packageName: string;
    price: number;
    discountPrice?: number;
    inclusions: { id: number; description: string; isIncluded: boolean }[];
}

interface TourDetail {
    id: string;
    title: string;
    description: string;
    location: string;
    durationDay: number;
    durationNight: number;
    startDate?: string;
    imageUrls: string[];
    packages: TourPackage[];
}

export default function TourDetailPage() {
    const { id } = useParams();
    const [tour, setTour] = useState<TourDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>("");

    // Resim URL Düzeltici
    const getImageUrl = (path: string) => {
        if (!path) return "/banner.png";
        if (path.startsWith("http")) return path;

        // Birbaşa canlı serverdən çəksin (Localhost problemi olmasın)
        return `https://api.guventurizm.az/api/files/${path}`;
    };

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await api.get(`/Tours/${id}`);
                setTour(response.data);
                if (response.data.imageUrls?.length > 0) {
                    setSelectedImage(getImageUrl(response.data.imageUrls[0]));
                }
            } catch (error) {
                console.error("Tur məlumatları alınmadı:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTour();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!tour) return <div className="text-center py-20">Tur tapılmadı.</div>;

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* --- GALEREYA HİSSƏSİ --- */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    {/* Başlıq və Məkan */}
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                            {tour.title}
                        </h1>
                        <div className="flex items-center text-gray-500">
                            <MapPinIcon className="w-5 h-5 mr-1 text-primary" />
                            <span className="font-medium">{tour.location}</span>
                        </div>
                    </div>

                    {/* Şəkillər Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px] md:h-[500px]">
                        {/* Əsas Böyük Şəkil */}
                        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-sm group">
                            <Image
                                src={selectedImage || "/banner.png"}
                                alt={tour.title}
                                fill
                                className="object-cover transition duration-500 group-hover:scale-105"
                                priority
                            />
                        </div>

                        {/* Kiçik Şəkillər (Yan tərəf) */}
                        <div className="hidden lg:grid grid-rows-3 gap-4">
                            {tour.imageUrls?.slice(0, 3).map((img, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition"
                                    onClick={() => setSelectedImage(getImageUrl(img))}
                                >
                                    <Image
                                        src={getImageUrl(img)}
                                        alt={`Gallery ${index}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                            {/* Əgər 3-dən çox şəkil varsa "Hamısına bax" effekti */}
                            {tour.imageUrls.length > 3 && (
                                <div className="relative rounded-xl overflow-hidden bg-gray-900 cursor-pointer flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">+{tour.imageUrls.length - 3} Şəkil</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* --- SOL TƏRƏF (Təsvir və Məlumat) --- */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* İkonlu Məlumatlar */}
                        <div className="flex flex-wrap gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-full text-primary">
                                    <ClockIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Müddət</p>
                                    <p className="font-bold text-gray-900">{tour.durationDay} Gün / {tour.durationNight} Gecə</p>
                                </div>
                            </div>

                            {tour.startDate && (
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                                        <CalendarDaysIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Başlama Tarixi</p>
                                        <p className="font-bold text-gray-900">
                                            {new Date(tour.startDate).toLocaleDateString("az-AZ")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Açıqlama */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tur Haqqında</h2>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {tour.description}
                            </div>
                        </div>

                        {/* --- PAKETLƏR BÖLMƏSİ (Ən vacib hissə) --- */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mövcud Paketlər</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tour.packages?.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className="bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                                    >
                                        {/* Paket Başlığı */}
                                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{pkg.packageName}</h3>
                                            <div className="flex items-baseline gap-2">
                                                {pkg.discountPrice ? (
                                                    <>
                                                        <span className="text-3xl font-bold text-primary">{pkg.discountPrice} ₼</span>
                                                        <span className="text-lg text-gray-400 line-through">{pkg.price} ₼</span>
                                                    </>
                                                ) : (
                                                    <span className="text-3xl font-bold text-primary">{pkg.price} ₼</span>
                                                )}
                                                <span className="text-sm text-gray-500">/ adambaşı</span>
                                            </div>
                                        </div>

                                        {/* Daxil Olanlar */}
                                        <div className="p-6 flex-grow">
                                            <ul className="space-y-3">
                                                {/* Backenddən string array gələrsə birbaşa map edirik, 
                                                    əgər tək string gələrsə split edirik */}
                                                {(Array.isArray(pkg.inclusions) ? pkg.inclusions : [])
                                                    .map((inc, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-gray-600">
                                                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm font-medium">{inc.description}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>

                                        {/* Seçim Butonu */}
                                        <div className="p-6 pt-0 mt-auto">
                                            <a
                                                href={`https://wa.me/994501234567?text=Salam, mən "${tour.title}" turunun "${pkg.packageName}" paketi ilə maraqlanıram.`}
                                                target="_blank"
                                                className="block w-full text-center py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition"
                                            >
                                                Paketi Seç
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- SAĞ TƏRƏF (Sticky Sidebar - Əlaqə) --- */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">

                            {/* Əlaqə Kartı */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sifariş və ya Suallar?</h3>
                                <p className="text-gray-500 text-sm mb-6">Bu tur haqqında ətraflı məlumat almaq üçün bizimlə əlaqə saxlayın.</p>

                                <div className="space-y-3">
                                    <a
                                        href="https://wa.me/994501234567"
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition shadow-md"
                                    >
                                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                        WhatsApp ilə Yazın
                                    </a>

                                    <a
                                        href="tel:+994501234567"
                                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition shadow-md"
                                    >
                                        <PhoneIcon className="w-5 h-5" />
                                        Zəng Edin
                                    </a>
                                </div>
                            </div>

                            {/* Qısa Məlumat */}
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-2">Niyə Güvən Turizm?</h4>
                                <ul className="space-y-2 text-sm text-blue-800">
                                    <li>✓ Peşəkar bələdçilər</li>
                                    <li>✓ Komfortlu nəqliyyat</li>
                                    <li>✓ Sığorta daxildir</li>
                                    <li>✓ 24/7 Dəstək</li>
                                </ul>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}