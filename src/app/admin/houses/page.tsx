"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/services/api";

// Backend DTO-ya uyğun interfeys
interface House {
    id: string;
    title: string;
    city: string;
    price: number;
    coverImage: string;
    category?: {
        title: string;
    };
    isDeleted: boolean;
    adminNotes?: string;
}

export default function AdminHousesPage() {
    const [houses, setHouses] = useState<House[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    // --- API-dən Evləri Çəkmək ---
    const fetchHouses = async () => {
        try {
            const response = await api.get("/Houses");
            setHouses(response.data);
        } catch (error) {
            console.error("Xəta:", error);
            alert("Evləri yükləmək mümkün olmadı.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHouses();
    }, []);

    // --- Ev Silmək (Soft Delete) ---
    const handleDelete = async (id: string) => {
        if (!confirm("Bu evi silmək istədiyinizə əminsiniz?")) return;

        try {
            await api.delete(`/Houses/${id}`);
            // Siyahını yenilə
            fetchHouses();
        } catch (error: any) {
            alert("Xəta: " + (error.response?.data?.message || "Silinmədi"));
        }
    };

    // --- Şəkil URL Helper ---
    // DİQQƏT: Buraya "https://api.guventurizm.az" birbaşa yazdıq ki,
    // "Mixed Content" xətası olmasın.
    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/100";
        if (path.startsWith("http")) return path;

        // Məcburi HTTPS ünvanı
        return `https://api.guventurizm.az/api/files/${path}`;
    };

    if (isLoading) return <div className="p-10 text-center">Yüklənir...</div>;

    return (
        <div>
            {/* Başlıq və Düymə */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Evlərin Siyahısı</h1>
                <Link
                    href="/admin/houses/create"
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2"
                >
                    <span>+</span> Yeni Ev Əlavə Et
                </Link>
            </div>

            {/* Cədvəl */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Şəkil</th>
                            <th className="p-4">Başlıq</th>
                            <th className="p-4">Şəhər</th>
                            <th className="p-4">Kateqoriya</th>
                            <th className="p-4">Qiymət</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Qeydlər</th>
                            <th className="p-4 text-right">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {houses.map((house) => (
                            <tr key={house.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                        <img
                                            src={getImageUrl(house.coverImage)}
                                            alt={house.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=No+Image" }}
                                        />
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-gray-900">{house.title}</td>
                                <td className="p-4">{house.city}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                        {house.category?.title || "-"}
                                    </span>
                                </td>
                                <td className="p-4 font-bold text-primary">{house.price} ₼</td>
                                <td className="p-4">
                                    {house.isDeleted ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Silinib</span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Aktiv</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {house.adminNotes ? (
                                        <button
                                            onClick={() => {
                                                setSelectedNote(house.adminNotes || "");
                                                setIsNoteModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:underline text-sm font-medium"
                                        >
                                            Oxu 📝
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/houses/edit/${house.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Düzəliş et">
                                            ✏️
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(house.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Boşdursa */}
                {houses.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Hələ heç bir ev əlavə edilməyib.
                    </div>
                )}
            </div>
            {/* Note Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">Admin Qeydi</h3>
                            <button
                                onClick={() => setIsNoteModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {selectedNote}
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsNoteModalOpen(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                            >
                                Bağla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}