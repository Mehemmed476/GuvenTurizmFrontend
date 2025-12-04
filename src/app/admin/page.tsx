"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import dynamic from "next/dynamic"; // <--- VACİB

// Qrafikləri dinamik yükləyirik (SSR-i söndürürük)
const DashboardCharts = dynamic(() => import("@/components/admin/DashboardCharts"), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 rounded-2xl animate-pulse"></div> // Yüklənənə qədər skelet
});

// Tip
interface DashboardStats {
    totalRevenue: number;
    totalBookings: number;
    pendingBookings: number;
    totalHouses: number;
    monthlyStats: { month: string; revenue: number; count: number }[];
}

export default function AdminPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/Stats");
                setStats(response.data);
            } catch (error) {
                console.error("Statistika xətası:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!stats) return <div className="p-10 text-center text-gray-500">Məlumat yoxdur</div>;

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

            {/* --- STATISTIKA KARTLARI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Kart 1: Gəlir */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ümumi Gəlir</p>
                            <h3 className="text-3xl font-extrabold text-green-600 mt-2">{stats.totalRevenue} ₼</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl text-2xl">💰</div>
                    </div>
                </div>

                {/* Kart 2: Sifarişlər */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Cəmi Sifariş</p>
                            <h3 className="text-3xl font-extrabold text-blue-600 mt-2">{stats.totalBookings}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-2xl">📅</div>
                    </div>
                </div>

                {/* Kart 3: Gözləyən */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Təsdiq Gözləyən</p>
                            <h3 className="text-3xl font-extrabold text-orange-500 mt-2">{stats.pendingBookings}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl text-2xl">⏳</div>
                    </div>
                </div>

                {/* Kart 4: Evlər */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Aktiv Evlər</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-2">{stats.totalHouses}</h3>
                        </div>
                        <div className="p-3 bg-gray-100 text-gray-600 rounded-xl text-2xl">🏠</div>
                    </div>
                </div>
            </div>

            {/* --- QRAFİKLƏR (Dinamik Yüklənir) --- */}
            <DashboardCharts data={stats.monthlyStats} />

        </div>
    );
}