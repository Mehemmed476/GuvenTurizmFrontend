"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api, { uploadConfig } from "@/services/api";

// Backend-dən gələn DTO-lar üçün interfeyslər
interface Category {
    id: string;
    title: string;
}

interface Advantage {
    id: string;
    title: string;
}

export default function CreateHousePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Dinamik datalar üçün State-lər
    const [categories, setCategories] = useState<Category[]>([]);
    const [advantages, setAdvantages] = useState<Advantage[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Səhifə açılanda API-dən dataları çək
    useEffect(() => {
        const fetchData = async () => {
            try {
                // İki sorğunun eyni anda bitməsini gözləyirik (Parallel Fetching)
                const [catRes, advRes] = await Promise.all([
                    api.get("/Categories/active"),       // Aktiv kateqoriyalar
                    api.get("/HouseAdvantages/active")   // Aktiv üstünlüklər
                ]);

                setCategories(catRes.data);
                setAdvantages(advRes.data);
            } catch (error) {
                console.error("Data çəkilə bilmədi:", error);
                alert("Kateqoriya və ya üstünlükləri yükləmək olmadı.");
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchData();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(event.currentTarget);

            // API Sorğusu
            const response = await api.post("/Houses", formData, uploadConfig);

            if (response.status === 200 || response.status === 201 || response.status === 204) {
                alert("Ev uğurla yaradıldı! 🎉");
                router.push("/admin/houses");
            }
        } catch (error: any) {
            console.error("Xəta:", error);
            const message = error.response?.data?.title || error.response?.data?.message || "Xəta baş verdi";
            alert("Xəta: " + message);
        } finally {
            setIsLoading(false);
        }
    }

    if (isDataLoading) {
        return <div className="text-center py-20">Məlumatlar yüklənir...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-6">
                <a href="/admin/houses" className="text-gray-500 hover:text-gray-900 text-2xl">←</a>
                <h1 className="text-2xl font-bold text-gray-800">Yeni Ev Əlavə Et</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">

                {/* --- BÖLMƏ 1: Əsas Məlumatlar --- */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Evin Adı (Title)</label>
                        <input name="Title" required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" placeholder="Məs: Qəçrəşdə Lüks Villa" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Təsvir (Description)</label>
                        <textarea name="Description" required rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" placeholder="Ev haqqında ətraflı məlumat..."></textarea>
                    </div>
                </div>

                {/* --- BÖLMƏ 2: Detallar --- */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Detallar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="font-bold block mb-2 text-gray-700">Qiymət (AZN)</label>
                            <input name="Price" required type="number" step="0.01" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="font-bold block mb-2 text-gray-700">Otaq Sayı</label>
                            <input name="NumberOfRooms" required type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="font-bold block mb-2 text-gray-700">Yataq Sayı</label>
                            <input name="NumberOfBeds" required type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="font-bold block mb-2 text-gray-700">Mərtəbə Sayı</label>
                            <input name="NumberOfFloors" required type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="font-bold block mb-2 text-gray-700">Sahə (m²)</label>
                            <input name="Field" required type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                        </div>

                        {/* Dinamik Kateqoriya Seçimi */}
                        <div>
                            <label className="font-bold block mb-2 text-gray-700">Kateqoriya</label>
                            <select name="CategoryId" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary cursor-pointer">
                                <option value="">Seçin...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- BÖLMƏ 3: Üstünlüklər (Dinamik Checkbox) --- */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Evin Üstünlükləri</h3>

                    {advantages.length === 0 ? (
                        <p className="text-gray-500 text-sm">Heç bir üstünlük tapılmadı.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {advantages.map((adv) => (
                                <label key={adv.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-orange-50 hover:border-primary/50 transition-all">
                                    <input type="checkbox" name="AdvantageIds" value={adv.id} className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded" />
                                    <span className="text-gray-700 font-medium">{adv.title}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- BÖLMƏ 4: Ünvan --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Şəhər</label>
                        <select name="City" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary">
                            <option value="Quba">Quba</option>
                            <option value="Bakı">Bakı</option>
                            <option value="Qusar">Qusar</option>
                            <option value="İsmayıllı">İsmayıllı</option>
                            <option value="Qəbələ">Qəbələ</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Tam Ünvan</label>
                        <input name="Address" required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="font-bold block mb-2 text-gray-700">Google Maps Kodu</label>
                        <input name="GoogleMapsCode" type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary font-mono text-sm" placeholder="<iframe src='...'></iframe>" />
                    </div>
                </div>

                {/* --- BÖLMƏ 5: Şəkillər --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label className="font-bold block mb-2 text-gray-700">
                            Əsas Şəkil (Cover)*
                        </label>
                        <div className="bg-orange-50/50 border-2 border-dashed border-primary/30 p-4 rounded-xl text-center hover:bg-orange-50 transition-colors">
                            <input name="CoverImage" required type="file" accept="image/*" className="w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-600" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="font-bold block mb-2 text-gray-700">
                            Qalereya (Çoxlu)
                        </label>
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded-xl text-center hover:bg-gray-100 transition-colors">
                            <input name="Images" multiple type="file" accept="image/*" className="w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-700" />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors mr-4">
                        Ləğv et
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? "Gözləyin..." : "Yadda Saxla"}
                    </button>
                </div>

            </form>
        </div>
    );
}