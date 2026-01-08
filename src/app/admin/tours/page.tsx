"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Tour {
    id: string;
    title: string;
    location: string;
    price: number; // Biz hesablayıb göstərəcəyik
    isActive: boolean;
}

export default function AdminToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);

    // Turları gətir
    const fetchTours = async () => {
        try {
            // Admin üçün olan endpointi çağırırıq (silinənlər daxil ola bilər)
            const response = await api.get("/Tours/admin/all");
            setTours(response.data);
        } catch (error) {
            console.error("Turlar yüklənmədi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTours();
    }, []);

    // Tur silmə funksiyası
    const handleDelete = async (id: string) => {
        if (!window.confirm("Bu turu silmək istədiyinizə əminsiniz?")) return;

        try {
            await api.delete(`/Tours/${id}`);
            // Siyahıdan çıxar
            setTours(tours.filter((t) => t.id !== id));
            alert("Tur uğurla silindi.");
        } catch (error) {
            alert("Xəta baş verdi.");
            console.error(error);
        }
    };

    if (loading) return <div className="p-8">Yüklənir...</div>;

    return (
        <div className="p-8">
            {/* Başlıq və Düymə */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Turlar</h1>
                <Link
                    href="/admin/tours/create"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    Yeni Tur
                </Link>
            </div>

            {/* Cədvəl */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="p-4">Tur Adı</th>
                            <th className="p-4">Məkan</th>
                            <th className="p-4 text-center">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tours.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500">
                                    Hələ heç bir tur əlavə edilməyib.
                                </td>
                            </tr>
                        ) : (
                            tours.map((tour) => (
                                <tr key={tour.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-900">{tour.title}</td>
                                    <td className="p-4 text-gray-600">{tour.location}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-3">
                                            <Link
                                                href={`/admin/tours/edit/${tour.id}`}
                                                className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-lg"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(tour.id)}
                                                className="text-red-600 hover:text-red-800 p-2 bg-red-50 rounded-lg"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}