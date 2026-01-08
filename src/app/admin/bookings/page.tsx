"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { az } from "date-fns/locale";

// --- TİPLƏR ---
interface House {
    id: string;
    title: string;
    coverImage: string;
    address: string;
    price: number;
}

interface Booking {
    id: string;
    houseId: string;
    house?: House;
    userId?: string;
    userName?: string;
    userEmail?: string;
    userPhoneNumber?: string;
    startDate: string;
    endDate: string;
    status: number; // 0: Pending, 1: Confirmed, 2: Canceled
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHouseId, setSelectedHouseId] = useState("");
    const [houses, setHouses] = useState<House[]>([]);

    const [cardNumber, setCardNumber] = useState("");

    // --- İLK YÜKLƏNMƏ ---
    useEffect(() => {
        const savedCard = localStorage.getItem("adminCardNumber");
        if (savedCard) setCardNumber(savedCard);

        const fetchData = async () => {
            try {
                const [bookingsRes, housesRes] = await Promise.all([
                    api.get("/Bookings"),
                    api.get("/Houses")
                ]);

                const sorted = bookingsRes.data.sort((a: Booking, b: Booking) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );
                setBookings(sorted);
                setHouses(housesRes.data);
            } catch (error) {
                console.error("Xəta:", error);
                toast.error("Məlumatları yükləmək olmadı.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCardNumber(val);
        localStorage.setItem("adminCardNumber", val);
    };

    // --- STATUS DƏYİŞMƏK (Əsas işi görən) ---
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

            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
        } catch (error: any) {
            toast.error("Xəta baş verdi", { id: loadingToast });
        }
    };

    // --- TƏSDİQLƏMƏ PƏNCƏRƏSİ (Toast) ---
    // Bax bu funksiya unudulmuşdu, indi yerinə qoyduq
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

    const handleDelete = async (id: string) => {
        if (!confirm("Bu rezervasiyanı birdəfəlik silmək istədiyinizə əminsiniz?")) return;
        try {
            await api.delete(`/Bookings/${id}`);
            toast.success("Rezervasiya silindi.");
            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            toast.error("Silinmədi.");
        }
    };

    const openWhatsApp = (booking: Booking) => {
        if (!booking.userPhoneNumber) {
            toast.error("İstifadəçinin nömrəsi yoxdur!");
            return;
        }
        if (!cardNumber) {
            toast.error("Əvvəlcə kart nömrəsini qeyd edin!");
            document.getElementById("cardInput")?.focus();
            return;
        }

        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = booking.house ? diffDays * booking.house.price : 0;

        const message = `Salam ${booking.userName || "Hörmətli müştəri"}! 👋
Güvən Turizm-ə xoş gəlmisiniz.

🏠 *${booking.house?.title}* evi üçün rezervasiya sorğunuzu gördük.

🗓 Tarixlər: ${format(start, "d MMM")} - ${format(end, "d MMM")} (${diffDays} gecə)
💰 Cəmi Məbləğ: *${totalPrice} AZN*

Zəhmət olmasa ödənişi bu karta göndərin və qəbzi bizimlə paylaşın:
💳 *${cardNumber}*

Təşəkkürlər!`;

        // --- DÜZELTME BAŞLANGICI ---
        
        // 1. Sadece rakamları al
        let cleanPhone = booking.userPhoneNumber.replace(/[^0-9]/g, "");

        // 2. Başındaki '0'ı kaldır (Örn: 050 -> 50)
        if (cleanPhone.startsWith("0")) {
            cleanPhone = cleanPhone.substring(1);
        }

        // 3. Ülke kodu (994) yoksa ekle (Örn: 50xxxx -> 99450xxxx)
        // Not: Eğer farklı ülkelerden müşteri alıyorsanız buraya daha detaylı kontrol eklemek gerekebilir.
        if (!cleanPhone.startsWith("994")) {
            cleanPhone = "994" + cleanPhone;
        }

        // 4. Daha güvenilir olan 'api.whatsapp.com' linkini kullan
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, "_blank");
        
        // --- DÜZELTME SONU ---
    };

    const getImageUrl = (path?: string) => {
        if (!path) return "https://via.placeholder.com/100?text=No+Image";
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
        return `${baseUrl}/api/files/${path}`;
    };

    const formatDate = (dateStr: string) => {
        try { return format(new Date(dateStr), "d MMM", { locale: az }); }
        catch { return dateStr; }
    };

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0: return { label: "Gözləyir", bg: "bg-yellow-50 text-yellow-600 border-yellow-200", icon: "⏳" };
            case 1: return { label: "Təsdiqləndi", bg: "bg-green-50 text-green-600 border-green-200", icon: "✅" };
            case 2: return { label: "Ləğv edildi", bg: "bg-red-50 text-red-600 border-red-200", icon: "🚫" };
            default: return { label: "-", bg: "bg-gray-50", icon: "" };
        }
    };

    const filteredBookings = bookings.filter(b => {
        const lowerTerm = searchTerm.toLowerCase();
        const matchesSearch = (b.userEmail?.toLowerCase() || "").includes(lowerTerm) || (b.house?.title?.toLowerCase() || "").includes(lowerTerm);
        const matchesHouse = selectedHouseId ? b.houseId === selectedHouseId : true;
        return matchesSearch && matchesHouse;
    });

    if (isLoading) return <div className="p-10 text-center text-gray-500">Yüklənir...</div>;

    return (
        <div className="space-y-8 pb-20">

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rezervasiyalar</h1>
                    <p className="text-gray-500 mt-1">Sifarişləri idarə et</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Bank Kartı */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Ödəniş Kartı</p>
                            <h3 className="text-lg font-bold mt-1">Müştəri Hesabı</h3>
                        </div>
                        <div className="text-2xl opacity-80">💳</div>
                    </div>
                    <div className="relative">
                        <input
                            id="cardInput"
                            type="text"
                            value={cardNumber}
                            onChange={handleCardChange}
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xl font-mono placeholder-white/30 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all tracking-wider"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                            Auto-Saved
                        </div>
                    </div>
                </div>

                {/* Filtr */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Müştəri və ya Ev adı..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="w-full md:w-1/3 relative">
                            <select
                                value={selectedHouseId}
                                onChange={(e) => setSelectedHouseId(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary appearance-none cursor-pointer"
                            >
                                <option value="">Bütün Evlər</option>
                                {houses.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CƏDVƏL */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Ev</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Müştəri</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Status</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase text-right">Əməliyyatlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((item) => {
                                const statusInfo = getStatusInfo(item.status);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">

                                        {/* Ev */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                                    <img src={getImageUrl(item.house?.coverImage)} alt="Ev" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.house?.title}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Müştəri */}
                                        <td className="p-5">
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-900">{item.userName || "İstifadəçi"}</p>
                                                <p className="text-xs text-gray-500">{item.userPhoneNumber || "Nömrə yoxdur"}</p>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </td>

                                        {/* Əməliyyatlar */}
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 items-center">

                                                {/* WhatsApp Button */}
                                                <button
                                                    onClick={() => openWhatsApp(item)}
                                                    className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                                    title="WhatsApp"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                                </button>

                                                {/* Təsdiq Button (Yalnız Pending olanda) */}
                                                {item.status === 0 && (
                                                    <button
                                                        onClick={() => confirmStatusChange(item, 1)}
                                                        className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center border border-blue-100"
                                                        title="Təsdiqlə"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                )}

                                                {/* Ləğv Button (Yalnız Ləğv olunmayıbsa) */}
                                                {item.status !== 2 && (
                                                    <button
                                                        onClick={() => confirmStatusChange(item, 2)}
                                                        className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center border border-orange-100"
                                                        title="Ləğv Et"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}

                                                {/* Sil Button */}
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-gray-100"
                                                    title="Tamamilə Sil"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {bookings.length === 0 && (
                        <div className="p-12 text-center text-gray-400">Heç bir rezervasiya tapılmadı.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
