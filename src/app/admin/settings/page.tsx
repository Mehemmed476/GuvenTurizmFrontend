"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";

// Tiplər
interface Category {
    id: string;
    title: string;
    description?: string;
}

interface Advantage {
    id: string;
    title: string;
}

export default function SettingsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [advantages, setAdvantages] = useState<Advantage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Yeni məlumatlar üçün input state-ləri
    const [newCatTitle, setNewCatTitle] = useState("");
    const [newCatDesc, setNewCatDesc] = useState("");
    const [newAdvTitle, setNewAdvTitle] = useState("");

    // --- MƏLUMATLARI ÇƏK ---
    const fetchData = async () => {
        try {
            const [catRes, advRes] = await Promise.all([
                api.get("/Categories"),        // Bütün kateqoriyalar (Admin üçün)
                api.get("/HouseAdvantages")    // Bütün üstünlüklər (Admin üçün)
            ]);
            setCategories(catRes.data);
            setAdvantages(advRes.data);
        } catch (error) {
            console.error("Xəta:", error);
            alert("Məlumatları yükləmək olmadı.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- KATEQORİYA ƏMƏLİYYATLARI ---
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatTitle.trim()) return;

        try {
            await api.post("/Categories", {
                title: newCatTitle,
                description: newCatDesc
            });
            setNewCatTitle("");
            setNewCatDesc("");
            fetchData(); // Siyahını yenilə
        } catch (error: any) {
            alert("Xəta: " + (error.response?.data?.message || "Kateqoriya yaranmadı"));
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Bu kateqoriyanı silmək istədiyinizə əminsiniz?")) return;
        try {
            await api.delete(`/Categories/${id}`);
            fetchData();
        } catch (error) {
            alert("Silinmədi. Ola bilsin bu kateqoriyaya bağlı evlər var.");
        }
    };

    // --- ÜSTÜNLÜK (ADVANTAGE) ƏMƏLİYYATLARI ---
    const handleAddAdvantage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdvTitle.trim()) return;

        try {
            await api.post("/HouseAdvantages", {
                title: newAdvTitle
            });
            setNewAdvTitle("");
            fetchData();
        } catch (error: any) {
            alert("Xəta: " + (error.response?.data?.message || "Üstünlük yaranmadı"));
        }
    };

    const handleDeleteAdvantage = async (id: string) => {
        if (!confirm("Silmək istədiyinizə əminsiniz?")) return;
        try {
            await api.delete(`/HouseAdvantages/${id}`);
            fetchData();
        } catch (error) {
            alert("Silinmədi.");
        }
    };

    if (isLoading) return <div className="p-10 text-center">Yüklənir...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Ayarlar</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* --- SOL TƏRƏF: KATEQORİYALAR --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        📂 Kateqoriyalar
                    </h2>

                    {/* Əlavə Etmə Formu */}
                    <form onSubmit={handleAddCategory} className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="mb-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Başlıq</label>
                            <input
                                type="text"
                                value={newCatTitle}
                                onChange={(e) => setNewCatTitle(e.target.value)}
                                className="w-full p-2 border rounded-lg outline-none focus:border-primary"
                                placeholder="Məs: Villa"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Təsvir</label>
                            <input
                                type="text"
                                value={newCatDesc}
                                onChange={(e) => setNewCatDesc(e.target.value)}
                                className="w-full p-2 border rounded-lg outline-none focus:border-primary"
                                placeholder="Qısa məlumat..."
                            />
                        </div>
                        <button className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-primary transition-colors">
                            Əlavə Et
                        </button>
                    </form>

                    {/* Siyahı */}
                    <div className="space-y-3">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="font-bold text-gray-800">{cat.title}</p>
                                    <p className="text-xs text-gray-500">{cat.description || "Təsvir yoxdur"}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all"
                                    title="Sil"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && <p className="text-center text-gray-400 text-sm">Kateqoriya yoxdur.</p>}
                    </div>
                </div>

                {/* --- SAĞ TƏRƏF: ÜSTÜNLÜKLƏR (ADVANTAGES) --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        ✨ Ev Üstünlükləri
                    </h2>

                    {/* Əlavə Etmə Formu */}
                    <form onSubmit={handleAddAdvantage} className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newAdvTitle}
                                    onChange={(e) => setNewAdvTitle(e.target.value)}
                                    className="w-full p-2 border rounded-lg outline-none focus:border-primary h-full"
                                    placeholder="Məs: Wi-Fi, Hovuz..."
                                    required
                                />
                            </div>
                            <button className="bg-gray-900 text-white px-4 rounded-lg font-bold hover:bg-primary transition-colors">
                                +
                            </button>
                        </div>
                    </form>

                    {/* Siyahı */}
                    <div className="grid grid-cols-2 gap-2">
                        {advantages.map((adv) => (
                            <div key={adv.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors group">
                                <span className="font-medium text-gray-700">{adv.title}</span>
                                <button
                                    onClick={() => handleDeleteAdvantage(adv.id)}
                                    className="text-gray-300 group-hover:text-red-500 transition-colors"
                                    title="Sil"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    {advantages.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">Üstünlük yoxdur.</p>}
                </div>

            </div>
        </div>
    );
}