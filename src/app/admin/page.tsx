"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import Link from "next/link";
import { format } from "date-fns";
import { az } from "date-fns/locale";

// --- TİPLƏR ---
interface Booking {
    id: string;
    startDate: string;
    endDate: string;
    status: number; // 0: Pending, 1: Confirmed, 2: Canceled
    house?: {
        title: string;
        price: number; // Evin gecəlik qiyməti
    };
    userEmail?: string;
    createdDate?: string; // Əgər backend göndərirsə
}

interface House {
    id: string;
}

interface User {
    id: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        activeBookings: 0,
        totalHouses: 0,
        totalUsers: 0
    });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Bütün lazım olan dataları paralel çəkirik
                const [bookingsRes, housesRes, usersRes] = await Promise.all([
                    api.get("/Bookings"),
                    api.get("/Houses"),
                    api.get("/Users")
                ]);

                const bookings: Booking[] = bookingsRes.data;
                const houses: House[] = housesRes.data;
                const users: User[] = usersRes.data;

                // 1. Ümumi Gəlir Hesablama (Sadəcə təsdiqlənmişlər)
                // Qeyd: Backend-də "TotalPrice" sahəsi yoxdursa, biz (Gün sayı * Qiymət) kimi təxmini hesablayırıq.
                let totalRevenue = 0;
                let activeCount = 0;

                bookings.forEach(b => {
                    if (b.status === 1) { // Təsdiqlənmiş
                        activeCount++;

                        // Gün fərqini tap
                        const start = new Date(b.startDate);
                        const end = new Date(b.endDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        // Gəliri topla
                        if (b.house?.price) {
                            totalRevenue += diffDays * b.house.price;
                        }
                    }
                });

                // 2. Statistikaları Yenilə
                setStats({
                    revenue: totalRevenue,
                    activeBookings: activeCount,
                    totalHouses: houses.length,
                    totalUsers: users.length
                });

                // 3. Son 5 Rezervasiyanı Götür (Tarixə görə ən yenilər)
                // Backend-də CreatedAt varsa ona görə, yoxsa StartDate-ə görə sıralayaq
                const sortedBookings = bookings.sort((a, b) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                ).slice(0, 5);

                setRecentBookings(sortedBookings);

            } catch (error) {
                console.error("Dashboard data xətası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Yüklənir...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Xoş Gəldiniz, Admin 👋</h1>

            {/* --- STATİSTİKA KARTLARI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Ümumi Gəlir"
                    value={`${stats.revenue} ₼`}
                    icon="💰"
                    color="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Təsdiqli Sifariş"
                    value={stats.activeBookings.toString()}
                    icon="📅"
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Ev Sayısı"
                    value={stats.totalHouses.toString()}
                    icon="🏠"
                    color="bg-orange-100 text-orange-600"
                />
                <StatCard
                    title="Müştərilər"
                    value={stats.totalUsers.toString()}
                    icon="👥"
                    color="bg-purple-100 text-purple-600"
                />
            </div>

            {/* --- SON REZERVASİYALAR --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Son Rezervasiyalar</h3>
                    <Link href="/admin/bookings" className="text-sm text-primary font-bold hover:underline">
                        Hamısına bax →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold uppercase text-xs">
                            <tr>
                                <th className="p-4">Müştəri</th>
                                <th className="p-4">Ev</th>
                                <th className="p-4">Tarix</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentBookings.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">
                                        {item.userEmail || "Qonaq"}
                                    </td>
                                    <td className="p-4">
                                        {item.house?.title || "Naməlum Ev"}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {format(new Date(item.startDate), "d MMM", { locale: az })} - {format(new Date(item.endDate), "d MMM", { locale: az })}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={item.status} />
                                    </td>
                                </tr>
                            ))}
                            {recentBookings.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-400">Heç bir məlumat yoxdur</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- KÖMƏKÇİ KOMPONENTLƏR ---

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${color} text-2xl`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: number }) {
    switch (status) {
        case 0: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Gözləyir</span>;
        case 1: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Təsdiqləndi</span>;
        case 2: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Ləğv edildi</span>;
        default: return <span>-</span>;
    }
}