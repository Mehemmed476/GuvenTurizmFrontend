"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import Skeleton from "@/components/Skeleton";

// --- Yerli Tiplər ---
interface House {
    id: string;
    title: string;
    coverImage: string;
    city: string;
    address: string;
    price: number;
}

interface Booking {
    id: string;
    startDate: string;
    endDate: string;
    status: number; // 0: Pending, 1: Confirmed, 2: Canceled
    house?: House;
    createdAt: string;
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (loading && !user) return; // Auth hələ yüklənirsə gözlə

        const fetchMyBookings = async () => {
            try {
                const response = await api.get("/Bookings/me");
                // Ən son edilən rezervasiyaları yuxarı qoyaq
                const sorted = response.data.sort((a: Booking, b: Booking) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setBookings(sorted);
            } catch (error) {
                console.error("Xəta:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchMyBookings();
        else router.push("/");

    }, [user, router]);

    // Şəkil URL helper
    const getImageUrl = (path?: string) => {
        if (!path) return "https://via.placeholder.com/150?text=No+Image";
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
        return `${baseUrl}/api/files/${path}`;
    };

    // Tarix formatı
    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "d MMM, yyyy", { locale: az });
        } catch { return dateStr; }
    };

    // Status Dizaynı
    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0: return { label: "Təsdiq Gözləyir", classes: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "⏳" };
            case 1: return { label: "Təsdiqləndi", classes: "bg-green-100 text-green-700 border-green-200", icon: "✅" };
            case 2: return { label: "Ləğv Edildi", classes: "bg-red-100 text-red-700 border-red-200", icon: "🚫" };
            default: return { label: "Naməlum", classes: "bg-gray-100 text-gray-700", icon: "?" };
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* --- HEADER (Gradient Background) --- */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white pb-24 pt-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-400 p-1 shadow-2xl">
                            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                                {user.userName?.[0]?.toUpperCase()}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold">{user.userName}</h1>
                            <p className="text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-2">
                                <span className="bg-gray-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                    {user.role}
                                </span>
                            </p>
                        </div>

                        {/* Logout Button (Desktop - sağ künc) */}
                        <div className="md:ml-auto">
                            <button
                                onClick={logout}
                                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all font-medium flex items-center gap-2 backdrop-blur-sm"
                            >
                                <span>Çıxış Et</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT (Rezervasiyalar) --- */}
            <div className="container mx-auto px-4 -mt-12">

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
                    <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span>📅</span> Rezervasiyalarım
                        </h2>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Cəmi: {bookings.length}
                        </span>
                    </div>

                    <div className="p-6 md:p-8 bg-gray-50/30">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                            </div>
                        ) : bookings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {bookings.map((booking) => {
                                    const status = getStatusInfo(booking.status);

                                    // Gün sayını və cəmi məbləği hesablamaq (təxmini)
                                    const start = new Date(booking.startDate);
                                    const end = new Date(booking.endDate);
                                    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                    const totalPrice = booking.house ? diffDays * booking.house.price : 0;

                                    return (
                                        <div key={booking.id} className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col md:flex-row gap-6 relative overflow-hidden">

                                            {/* Status Badge (Absolute) */}
                                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${status.classes}`}>
                                                <span>{status.icon}</span> {status.label}
                                            </div>

                                            {/* Şəkil */}
                                            <div className="w-full md:w-48 h-40 md:h-auto rounded-xl overflow-hidden relative shadow-sm shrink-0">
                                                <Image
                                                    src={getImageUrl(booking.house?.coverImage)}
                                                    alt="Ev"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Məlumatlar */}
                                            <div className="flex-1 flex flex-col justify-center py-1">
                                                <div className="mb-1">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                        Sifariş Tarixi: {formatDate(booking.createdAt)}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                                    {booking.house?.title || "Naməlum Ev"}
                                                </h3>

                                                <div className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {booking.house?.city}, {booking.house?.address}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm mt-auto bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-400 font-bold uppercase">Giriş</span>
                                                        <span className="font-semibold text-gray-800">{formatDate(booking.startDate)}</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-200"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-400 font-bold uppercase">Çıxış</span>
                                                        <span className="font-semibold text-gray-800">{formatDate(booking.endDate)}</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                                                    <div className="flex flex-col ml-auto">
                                                        <span className="text-xs text-gray-400 font-bold uppercase text-right">Cəmi ({diffDays} gecə)</span>
                                                        <span className="font-bold text-primary text-lg text-right">{totalPrice} ₼</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4 text-gray-400">
                                    🧳
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Hələ səyahət yoxdur</h3>
                                <p className="text-gray-500 max-w-sm mb-8">
                                    Qubanın gözəlliklərini kəşf etməyə elə indi başlayın. İlk rezervasiyanızı edin!
                                </p>
                                <button
                                    onClick={() => router.push("/houses")}
                                    className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 flex items-center gap-2"
                                >
                                    Evləri Kəşf Et ➜
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}