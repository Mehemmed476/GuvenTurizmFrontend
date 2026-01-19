"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import api, { uploadConfig } from "@/services/api";
import toast from "react-hot-toast";

// --- TİPLƏR ---
interface Category {
    id: string;
    title: string;
}

interface Advantage {
    id: string;
    title: string;
}

interface HouseFile {
    id: string;
    image: string;
}

// Mövcud evi yükləmək üçün interface
interface HouseDetail {
    id: string;
    title: string;
    description: string;
    price: number;
    numberOfRooms: number;
    numberOfBeds: number;
    numberOfFloors: number;
    field: number;
    address: string;
    city: string;
    googleMapsCode: string;
    coverImage: string;
    categoryId: string;
    houseHouseAdvantageRels: { houseAdvantageId: string }[];
    images: HouseFile[];
    adminNotes: string;
}

export default function EditHousePage() {
    const router = useRouter();
    const params = useParams();
    const houseId = params.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // Select seçimləri üçün
    const [categories, setCategories] = useState<Category[]>([]);
    const [advantages, setAdvantages] = useState<Advantage[]>([]);

    // Form State-ləri
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [adminNotes, setAdminNotes] = useState(""); // YENİ
    const [price, setPrice] = useState<number | "">("");
    const [rooms, setRooms] = useState<number | "">("");
    const [beds, setBeds] = useState<number | "">("");
    const [floors, setFloors] = useState<number | "">("");
    const [field, setField] = useState<number | "">("");
    const [categoryId, setCategoryId] = useState("");
    const [selectedAdvantageIds, setSelectedAdvantageIds] = useState<string[]>([]);

    const [city, setCity] = useState("Quba");
    const [address, setAddress] = useState("");
    const [googleMapsCode, setGoogleMapsCode] = useState("");

    // Şəkil State-ləri
    const [currentCoverImage, setCurrentCoverImage] = useState(""); // Serverdəki köhnə cover
    const [newCoverFile, setNewCoverFile] = useState<File | null>(null); // Yeni seçilən cover

    const [existingImages, setExistingImages] = useState<HouseFile[]>([]); // Qalereyadakı köhnə şəkillər
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Silinəcək şəkillərin ID-ləri

    // Şəkil URL helper
    // Şəkil URL helper
    const getImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;

        // Birbaşa canlı serverdən çəksin (Localhost problemi olmasın)
        return `https://api.guventurizm.az/api/files/${path}`;
    };

    // --- DATALARI YÜKLƏ ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, advRes, houseRes] = await Promise.all([
                    api.get("/Categories/active"),
                    api.get("/HouseAdvantages/active"),
                    api.get(`/Houses/${houseId}`)
                ]);

                setCategories(catRes.data);
                setAdvantages(advRes.data);

                const house: HouseDetail = houseRes.data;

                // Formu doldur
                setTitle(house.title);
                setDescription(house.description);
                setAdminNotes(house.adminNotes || ""); // YENİ
                setPrice(house.price);
                setRooms(house.numberOfRooms);
                setBeds(house.numberOfBeds);
                setFloors(house.numberOfFloors);
                setField(house.field);
                setCategoryId(house.categoryId);
                setCity(house.city || "Quba");
                setAddress(house.address || "");
                setGoogleMapsCode(house.googleMapsCode || "");

                // Üstünlükləri seç
                const activeAdvIds = house.houseHouseAdvantageRels.map(r => r.houseAdvantageId);
                setSelectedAdvantageIds(activeAdvIds);

                // Şəkillər
                setCurrentCoverImage(house.coverImage);
                setExistingImages(house.images);

            } catch (error) {
                console.error(error);
                toast.error("Məlumatları yükləmək olmadı.");
                router.push("/admin/houses");
            } finally {
                setDataLoading(false);
            }
        };

        if (houseId) loadData();
    }, [houseId, router]);

    // --- CHECKBOX DƏYİŞİMİ ---
    const handleAdvantageChange = (id: string) => {
        setSelectedAdvantageIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // --- QALEREYADAN ŞƏKİL SİLMƏK (Vizual) ---
    const handleDeleteExistingImage = (imgId: string) => {
        if (!confirm("Bu şəkli silmək istədiyinizə əminsiniz? (Yadda saxla basanda silinəcək)")) return;

        // Ekranda gizlət
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
        // Silinəcəklər siyahısına əlavə et
        setImagesToDelete(prev => [...prev, imgId]);
    };

    // --- SUBMIT (YENİLƏMƏ) ---
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();

            // Əsas sahələr (HousePutDTO)
            formData.append("Id", houseId);
            formData.append("Title", title);
            formData.append("Description", description);
            formData.append("AdminNotes", adminNotes); // YENİ
            formData.append("Price", price.toString());
            formData.append("NumberOfRooms", rooms.toString());
            formData.append("NumberOfBeds", beds.toString());
            formData.append("NumberOfFloors", floors.toString());
            formData.append("Field", field.toString());
            formData.append("CategoryId", categoryId);
            formData.append("City", city);
            formData.append("Address", address);
            formData.append("GoogleMapsCode", googleMapsCode);

            // Üstünlüklər (Collection)
            selectedAdvantageIds.forEach(id => {
                formData.append("AdvantageIds", id);
            });

            // Silinəcək Şəkillər (Collection)
            imagesToDelete.forEach(id => {
                formData.append("ImageIdsToDelete", id);
            });

            // Yeni Cover Image (Varsa)
            if (newCoverFile) {
                formData.append("CoverImage", newCoverFile);
            }

            // Yeni Qalereya Şəkilləri (Input-dan birbaşa götürürük)
            const fileInput = (document.getElementById("newGalleryImages") as HTMLInputElement);
            if (fileInput && fileInput.files) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append("NewImages", fileInput.files[i]);
                }
            }

            // PUT Sorğusu
            await api.put(`/Houses/${houseId}`, formData, uploadConfig);

            toast.success("Ev uğurla yeniləndi!");
            router.push("/admin/houses");

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Xəta baş verdi.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (dataLoading) return <div className="p-20 text-center">Yüklənir...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 text-2xl">←</button>
                <h1 className="text-2xl font-bold text-gray-800">Evi Yenilə</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">

                {/* --- 1. ƏSAS MƏLUMATLAR --- */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Evin Adı</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required type="text" className="w-full p-3 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Təsvir</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full p-3 bg-gray-50 border rounded-xl"></textarea>
                    </div>
                    {/* Admin Qeydləri (YENİ) */}
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Admin Qeydləri</label>
                        <textarea
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                            rows={2}
                            className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 text-gray-700"
                            placeholder="Yalnız adminlər üçün qeyd..."
                        ></textarea>
                    </div>
                </div>

                {/* --- 2. DETALLAR --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Qiymət (AZN)</label>
                        <input value={price} onChange={e => setPrice(Number(e.target.value))} required type="number" className="w-full p-3 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Otaq</label>
                        <input value={rooms} onChange={e => setRooms(Number(e.target.value))} required type="number" className="w-full p-3 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Yataq</label>
                        <input value={beds} onChange={e => setBeds(Number(e.target.value))} required type="number" className="w-full p-3 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Mərtəbə</label>
                        <input value={floors} onChange={e => setFloors(Number(e.target.value))} required type="number" className="w-full p-3 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Sahə (m²)</label>
                        <input value={field} onChange={e => setField(Number(e.target.value))} required type="number" className="w-full p-3 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Kateqoriya</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full p-3 bg-gray-50 border rounded-xl cursor-pointer">
                            <option value="">Seçin...</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
                        </select>
                    </div>
                </div>

                {/* --- 3. ÜNVAN --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Şəhər</label>
                        <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl">
                            {["Quba", "Bakı", "Qusar", "İsmayıllı", "Qəbələ"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Tam Ünvan</label>
                        <input value={address} onChange={e => setAddress(e.target.value)} required type="text" className="w-full p-3 bg-gray-50 border rounded-xl" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="font-bold block mb-2 text-gray-700">Google Maps Kodu</label>
                        <input value={googleMapsCode} onChange={e => setGoogleMapsCode(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm" />
                    </div>
                </div>

                {/* --- 4. ÜSTÜNLÜKLƏR --- */}
                <div>
                    <h3 className="font-bold mb-4 text-gray-900">Evin Üstünlükləri</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {advantages.map((adv) => (
                            <label key={adv.id} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${selectedAdvantageIds.includes(adv.id) ? 'bg-orange-50 border-primary' : 'bg-white border-gray-200'}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedAdvantageIds.includes(adv.id)}
                                    onChange={() => handleAdvantageChange(adv.id)}
                                    className="w-5 h-5 text-primary focus:ring-primary rounded"
                                />
                                <span className="text-gray-700 font-medium">{adv.title}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* --- 5. ŞƏKİLLƏR --- */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Şəkillər</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* COVER IMAGE */}
                        <div className="md:col-span-1">
                            <label className="font-bold block mb-2 text-gray-700">Əsas Şəkil (Cover)</label>

                            {/* Köhnə Şəkil (Əgər yenisi seçilməyibsə) */}
                            {!newCoverFile && currentCoverImage && (
                                <div className="mb-4 relative group">
                                    <img src={getImageUrl(currentCoverImage)} alt="Cover" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm rounded-xl transition-opacity">
                                        Mövcud Şəkil
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files && setNewCoverFile(e.target.files[0])}
                                className="w-full p-2 bg-gray-50 border rounded-xl text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">Dəyişmək üçün yeni fayl seçin</p>
                        </div>

                        {/* GALLERY IMAGES */}
                        <div className="md:col-span-2">
                            <label className="font-bold block mb-2 text-gray-700">Qalereya</label>

                            {/* Mövcud Şəkillər */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <img src={getImageUrl(img.image)} alt="Gallery" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                                        {/* Silmə Düyməsi */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExistingImage(img.id)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Sil"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Yeni Şəkil Yükləmə */}
                            <input
                                id="newGalleryImages"
                                type="file"
                                multiple
                                accept="image/*"
                                className="w-full p-2 bg-gray-50 border rounded-xl text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">Əlavə etmək istədiyiniz yeni şəkilləri seçin</p>
                        </div>
                    </div>
                </div>

                {/* --- DÜYMƏLƏR --- */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors">
                        Ləğv et
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? "Yenilənir..." : "Yadda Saxla"}
                    </button>
                </div>

            </form>
        </div>
    );
}