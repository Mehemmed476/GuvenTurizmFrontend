"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import toast from "react-hot-toast"; // <--- Alert əvəzinə toast istifadə edək

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
    // --- STATE-LƏR ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [advantages, setAdvantages] = useState<Advantage[]>([]);

    // Sayt Tənzimləmələri (YENİ)
    const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
    const [savingSettings, setSavingSettings] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    // Yeni məlumatlar üçün inputlar
    const [newCatTitle, setNewCatTitle] = useState("");
    const [newCatDesc, setNewCatDesc] = useState("");
    const [newAdvTitle, setNewAdvTitle] = useState("");

    // --- MƏLUMATLARI ÇƏK ---
    const fetchData = async () => {
        try {
            const [catRes, advRes, settRes] = await Promise.all([
                api.get("/Categories"),
                api.get("/HouseAdvantages"),
                api.get("/Common/settings") // <--- YENİ
            ]);
            setCategories(catRes.data);
            setAdvantages(advRes.data);
            setSiteSettings(settRes.data);
        } catch (error) {
            console.error("Xəta:", error);
            toast.error("Məlumatları yükləmək olmadı.");
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
            await api.post("/Categories", { title: newCatTitle, description: newCatDesc });
            setNewCatTitle("");
            setNewCatDesc("");
            fetchData();
            toast.success("Kateqoriya əlavə edildi");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xəta baş verdi");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Bu kateqoriyanı silmək istədiyinizə əminsiniz?")) return;
        try {
            await api.delete(`/Categories/${id}`);
            fetchData();
            toast.success("Silindi");
        } catch (error) {
            toast.error("Silinmədi. Ola bilsin bu kateqoriyaya bağlı evlər var.");
        }
    };

    // --- ÜSTÜNLÜK (ADVANTAGE) ƏMƏLİYYATLARI ---
    const handleAddAdvantage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdvTitle.trim()) return;

        try {
            await api.post("/HouseAdvantages", { title: newAdvTitle });
            setNewAdvTitle("");
            fetchData();
            toast.success("Üstünlük əlavə edildi");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xəta baş verdi");
        }
    };

    const handleDeleteAdvantage = async (id: string) => {
        if (!confirm("Silmək istədiyinizə əminsiniz?")) return;
        try {
            await api.delete(`/HouseAdvantages/${id}`);
            fetchData();
            toast.success("Silindi");
        } catch (error) {
            toast.error("Silinmədi.");
        }
    };

    // --- SAYT TƏNZİMLƏMƏLƏRİ (YENİ) ---
    const handleSettingChange = (key: string, value: string) => {
        setSiteSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            // Hər birini update edirik
            const updates = Object.keys(siteSettings).map(key =>
                api.put("/Common/settings", { key, value: siteSettings[key] })
            );
            await Promise.all(updates);
            toast.success("Tənzimləmələr yadda saxlanıldı! 🎉");
        } catch (error) {
            toast.error("Xəta baş verdi.");
        } finally {
            setSavingSettings(false);
        }
    };

    // Setting Sahələri
    const settingFields = [
        { key: "PhoneNumber", label: "Telefon Nömrəsi", type: "text", placeholder: "+994 50 000 00 00" },
        { key: "Email", label: "Email Ünvanı", type: "email", placeholder: "info@example.com" },
        { key: "Address", label: "Ünvan", type: "text", placeholder: "Bakı, Azərbaycan" },
        { key: "Instagram", label: "Instagram Linki", type: "url", placeholder: "https://instagram.com/..." },
        { key: "Facebook", label: "Facebook Linki", type: "url", placeholder: "https://facebook.com/..." },
        { key: "Whatsapp", label: "WhatsApp Linki", type: "url", placeholder: "https://wa.me/..." },
        { key: "Copyright", label: "Footer Yazısı", type: "text", placeholder: "© 2025..." },
    ];

    if (isLoading) return <div className="p-10 text-center text-gray-500">Yüklənir...</div>;

    return (
        <div className="pb-20">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Ayarlar Paneli</h1>

            {/* --- HİSSƏ 1: KATEQORİYA VƏ ÜSTÜNLÜKLƏR --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                {/* KATEQORİYALAR */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">📂 Kateqoriyalar</h2>
                    <form onSubmit={handleAddCategory} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="space-y-3">
                            <input type="text" value={newCatTitle} onChange={(e) => setNewCatTitle(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-primary" placeholder="Məs: Villa" required />
                            <input type="text" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-primary" placeholder="Qısa məlumat..." />
                            <button className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-primary transition-colors">Əlavə Et</button>
                        </div>
                    </form>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <div><p className="font-bold text-gray-800">{cat.title}</p><p className="text-xs text-gray-500">{cat.description || "-"}</p></div>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all">🗑️</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ÜSTÜNLÜKLƏR */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">✨ Ev Üstünlükləri</h2>
                    <form onSubmit={handleAddAdvantage} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex gap-2">
                            <input type="text" value={newAdvTitle} onChange={(e) => setNewAdvTitle(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-primary" placeholder="Məs: Wi-Fi, Hovuz..." required />
                            <button className="bg-gray-900 text-white px-4 rounded-lg font-bold hover:bg-primary transition-colors">+</button>
                        </div>
                    </form>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {advantages.map((adv) => (
                            <div key={adv.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors group">
                                <span className="font-medium text-gray-700 text-sm">{adv.title}</span>
                                <button onClick={() => handleDeleteAdvantage(adv.id)} className="text-gray-300 group-hover:text-red-500 transition-colors">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- HİSSƏ 2: SAYT TƏNZİMLƏMƏLƏRİ (YENİ) --- */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">⚙️ Ümumi Tənzimləmələr</h2>
                        <p className="text-gray-500 mt-1">Footer və Əlaqə məlumatlarını buradan idarə edin.</p>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex items-center gap-2"
                    >
                        {savingSettings ? "Yadda saxlanılır..." : "✅ Yadda Saxla"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {settingFields.map((field) => (
                        <div key={field.key} className={field.key === "Address" || field.key === "Copyright" ? "md:col-span-2" : ""}>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{field.label}</label>
                            <input
                                type={field.type}
                                value={siteSettings[field.key] || ""}
                                onChange={(e) => handleSettingChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-800"
                            />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}