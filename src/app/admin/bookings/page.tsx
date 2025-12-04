"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { az } from "date-fns/locale";

// --- TİPLƏR ---
interface House {
    id: string; // Dropdown üçün lazımdır
    title: string;
    coverImage: string;
    address: string;
}

interface Booking {
    id: string;
    houseId: string;
    house?: House;
    userId?: string;
    userEmail?: string;
    startDate: string;
    endDate: string;
    status: number;
    isDeleted: boolean;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [houses, setHouses] = useState<House[]>([]); // Evlərin siyahısı (Filter üçün)
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

    // Filtr State-ləri
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHouseId, setSelectedHouseId] = useState("");

    const [isLoading, setIsLoading] = useState(true);

    // --- STATİSTİKA ---
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 0).length,
        confirmed: bookings.filter(b => b.status === 1).length,
        canceled: bookings.filter(b => b.status === 2).length,
    };

    // --- MƏLUMATLARI ÇƏK (Rezervasiyalar + Evlər) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsRes, housesRes] = await Promise.all([
                    api.get("/Bookings"),
                    api.get("/Houses") // Bütün evləri çəkirik ki, filterə qoyaq
                ]);

                // Rezervasiyaları tarixə görə sırala (Yenilər üstdə)
                const sortedBookings = bookingsRes.data.sort((a: Booking, b: Booking) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );

                setBookings(sortedBookings);
                setHouses(housesRes.data);
                setFilteredBookings(sortedBookings); // İlk açılışda hamısını göstər
            } catch (error) {
                console.error("Xəta:", error);
                toast.error("Məlumatları yükləmək olmadı.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- FİLTRLƏMƏ MƏNTİQİ (Axtarış + Ev Seçimi) ---
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();

        const filtered = bookings.filter(b => {
            // 1. Axtarış sözü (Email və ya Ev Adı)
            const matchesSearch =
                (b.userEmail?.toLowerCase() || "").includes(lowerTerm) ||
                (b.house?.title?.toLowerCase() || "").includes(lowerTerm);

            // 2. Ev Filtri (Seçilibsə yoxla, seçilməyibsə hamısını göstər)
            const matchesHouse = selectedHouseId ? b.houseId === selectedHouseId : true;

            return matchesSearch && matchesHouse;
        });

        setFilteredBookings(filtered);
    }, [searchTerm, selectedHouseId, bookings]);

    // --- STATUS DƏYİŞMƏK ---
    const executeStatusChange = async (booking: Booking, newStatus: number) => {
        const loadingToast = toast.loading("Status dəyişdirilir...");
        try {
            await api.put(`/Bookings/${booking.id}`, {
                id: booking.id,
                startDate: booking.startDate,
                endDate: booking.endDate,
                status: newStatus
            });

            toast.success("Status uğurla yeniləndi!", { id: loadingToast });

            // Siyahını yeniləmək üçün sadəcə state-i dəyişirik (API-yə təkrar getmirik)
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));

        } catch (error: any) {
            toast.error("Xəta baş verdi", { id: loadingToast });
        }
    };

    const confirmStatusChange = (booking: Booking, newStatus: number) => {
        const actionText = newStatus === 1 ? "təsdiqləmək" : "ləğv etmək";
        const actionColor = newStatus === 1 ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600";

        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="text-center">
                    <p className="font-bold text-gray-800 text-lg">Status Dəyişimi</p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        Bu rezervasiyanı <br />
                        <span className="font-bold text-gray-900">{actionText}</span> istədiyinizə əminsiniz?
                    </p>
                </div>
                <div className="flex gap-3 justify-center mt-2">
                    <button onClick={() => toast.dismiss(t.id)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold">Xeyr</button>
                    <button onClick={() => { toast.dismiss(t.id); executeStatusChange(booking, newStatus); }} className={`px-5 py-2.5 text-white rounded-xl text-sm font-bold shadow-md ${actionColor}`}>Bəli, Dəyiş</button>
                </div>
            </div>
        ), { duration: 6000, position: "top-center" });
    };

    // --- SİLMƏK ---
    const handleDelete = async (id: string) => {
        if (!confirm("Bu rezervasiyanı birdəfəlik silmək istədiyinizə əminsiniz?")) return;
        try {
            await api.delete(`/Bookings/${id}`);
            toast.success("Rezervasiya silindi.");
            setBookings(prev => prev.filter(b => b.id !== id)); // State-dən sil
        } catch (error) {
            toast.error("Silinmədi.");
        }
    };

    // --- KÖMƏKÇİLER ---
    const formatDate = (dateStr: string) => {
        try { return format(new Date(dateStr), "d MMM, yyyy", { locale: az }); }
        catch (e) { return dateStr; }
    };

    const getImageUrl = (path?: string) => {
        if (!path) return "https://via.placeholder.com/100?text=No+Image";
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
        return `${baseUrl}/api/files/${path}`;
    };

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0: return { label: "Gözləyir", bg: "bg-yellow-100", text: "text-yellow-700", icon: "⏳" };
            case 1: return { label: "Təsdiqləndi", bg: "bg-green-100", text: "text-green-700", icon: "✅" };
            case 2: return { label: "Ləğv edildi", bg: "bg-red-100", text: "text-red-700", icon: "🚫" };
            default: return { label: "-", bg: "bg-gray-100", text: "text-gray-700", icon: "" };
        }
    };

    if (isLoading) return <div className="p-10 text-center text-gray-500">Yüklənir...</div>;

    return (
        <div className="space-y-8 pb-20">

            {/* BAŞLIQ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rezervasiyalar</h1>
                    <p className="text-gray-500 mt-1">Bütün sifarişləri idarə edin</p>
                </div>
            </div>

            {/* STATİSTİKA */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Cəmi Sifariş" count={stats.total} color="bg-blue-50 text-blue-600" icon="📦" />
                <StatCard title="Gözləyən" count={stats.pending} color="bg-yellow-50 text-yellow-600" icon="⏳" />
                <StatCard title="Təsdiqlənən" count={stats.confirmed} color="bg-green-50 text-green-600" icon="✅" />
                <StatCard title="Ləğv edilən" count={stats.canceled} color="bg-red-50 text-red-600" icon="🚫" />
            </div>

            {/* --- FİLTR VƏ AXTARIŞ ZOLAĞI --- */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">

                {/* Axtarış */}
                <div className="flex-1 w-full relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Müştəri emaili və ya Ev adı ilə axtar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>

                {/* Evə görə Filtr (Dropdown) */}
                <div className="w-full md:w-1/3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏠</span>
                    <select
                        value={selectedHouseId}
                        onChange={(e) => setSelectedHouseId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Bütün Evlər</option>
                        {houses.map(house => (
                            <option key={house.id} value={house.id}>
                                {house.title}
                            </option>
                        ))}
                    </select>
                    {/* Dropdown Oxu */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                    </div>
                </div>

            </div>

            {/* CƏDVƏL */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Ev Məlumatları</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Müştəri</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Tarixlər</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Əməliyyatlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((item) => {
                                const statusInfo = getStatusInfo(item.status);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                                                    <img src={getImageUrl(item.house?.coverImage)} alt="Ev" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.house?.title || "Ev silinib"}</p>
                                                    <p className="text-xs text-gray-500">{item.house?.address || "Ünvan yoxdur"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {item.userEmail ? item.userEmail[0].toUpperCase() : "?"}
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{item.userEmail || "Qonaq"}</p>
                                                    <p className="text-xs text-gray-400">ID: {item.userId ? item.userId.substring(0, 6) + "..." : "-"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    <span className="text-gray-600">{formatDate(item.startDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    <span className="text-gray-600">{formatDate(item.endDate)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.status !== 1 && (
                                                    <button onClick={() => confirmStatusChange(item, 1)} className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors border border-green-200" title="Təsdiqlə">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                )}
                                                {item.status !== 2 && (
                                                    <button onClick={() => confirmStatusChange(item, 2)} className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors border border-orange-200" title="Ləğv et">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg transition-colors border border-red-200" title="Sil">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredBookings.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">📭</div>
                            <h3 className="text-gray-900 font-bold text-lg">Rezervasiya Tapılmadı</h3>
                            <p className="text-gray-500 text-sm mt-1">Axtarış kriteriyalarına uyğun nəticə yoxdur.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, count, color, icon }: { title: string, count: number, color: string, icon: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{count}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
                {icon}
            </div>
        </div>
    );
}