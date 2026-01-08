"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeftIcon, TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

// Backend-dən gələn data tipləri
interface TourPackage {
    packageName: string;
    price: number | string;
    discountPrice?: number | string;
    inclusions: string[]; // String listəsi kimi gəlir
}

interface TourDetail {
    id: string;
    title: string;
    description: string;
    location: string;
    durationDay: number;
    durationNight: number;
    startDate?: string;
    imageUrls: string[]; // Şəkil yolları
    packages: TourPackage[];
    tourFiles?: { id: string; path: string; isMain: boolean }[]; // Şəkil ID-ləri lazım ola bilər
}

export default function EditTourPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // --- STATE ---
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        durationDay: 1,
        durationNight: 0,
        startDate: "",
    });

    // Şəkillər
    const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Silinəcək şəkillərin ID-ləri
    const [newFiles, setNewFiles] = useState<FileList | null>(null); // Yeni yüklənən şəkillər

    // Paketlər
    const [packages, setPackages] = useState<any[]>([
        { packageName: "", price: "", discountPrice: "", inclusions: "" }
    ]);

    // Resim URL Düzeltici
    const getImageUrl = (path: string) => {
        if (path.startsWith("http")) return path;
        return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${path}`;
    };

    // --- MƏLUMATLARI GƏTİR ---
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await api.get(`/Tours/${id}`);
                const data = response.data;

                // Formu doldur
                setFormData({
                    title: data.title,
                    description: data.description,
                    location: data.location,
                    durationDay: data.durationDay,
                    durationNight: data.durationNight,
                    startDate: data.startDate ? data.startDate.split('T')[0] : "",
                });

                // Şəkilləri ayarla (Backend TourFiles qaytarmalıdır, əgər sadəcə url qaytarırsa ID tapmaq çətin ola bilər. 
                // Backenddə GetById metodunda 'TourFiles' include etmişdik, ona görə ID-ləri oradan alacağıq)
                if (data.tourFiles) {
                    setExistingImages(data.tourFiles.map((f: any) => ({
                        id: f.id,
                        url: getImageUrl(f.path)
                    })));
                }

                // Paketləri ayarla
                if (data.packages) {
                    const formattedPackages = data.packages.map((p: any) => ({
                        packageName: p.packageName,
                        price: p.price,
                        discountPrice: p.discountPrice || "",
                        inclusions: Array.isArray(p.inclusions) ? p.inclusions.join("\n") : p.inclusions
                    }));
                    setPackages(formattedPackages);
                }

            } catch (error) {
                console.error("Tur məlumatları alınmadı:", error);
                alert("Tur tapılmadı.");
                router.push("/admin/tours");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTour();
    }, [id, router]);

    // --- PAKET MƏNTİQİ ---
    const addPackage = () => {
        setPackages([...packages, { packageName: "", price: "", discountPrice: "", inclusions: "" }]);
    };

    const removePackage = (index: number) => {
        const newPackages = [...packages];
        newPackages.splice(index, 1);
        setPackages(newPackages);
    };

    const handlePackageChange = (index: number, field: string, value: string) => {
        const newPackages = [...packages];
        newPackages[index][field] = value;
        setPackages(newPackages);
    };

    // --- ŞƏKİL SİLMƏ ---
    const handleDeleteExistingImage = (imageId: string) => {
        // UI-dan sil
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        // Silinəcəklər siyahısına at
        setImagesToDelete(prev => [...prev, imageId]);
    };

    // --- YADDA SAXLA (UPDATE) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();

            // Əsas Məlumatlar
            data.append("Title", formData.title);
            data.append("Description", formData.description);
            data.append("Location", formData.location);
            data.append("DurationDay", formData.durationDay.toString());
            data.append("DurationNight", formData.durationNight.toString());
            if (formData.startDate) data.append("StartDate", formData.startDate);

            // Silinəcək şəkillər (Backend List<Guid> gözləyir)
            imagesToDelete.forEach((imgId, index) => {
                data.append(`ImageIdsToDelete[${index}]`, imgId);
            });

            // Yeni şəkillər
            if (newFiles) {
                for (let i = 0; i < newFiles.length; i++) {
                    data.append("NewImages", newFiles[i]);
                }
            }

            // Paketlər
            packages.forEach((pkg, index) => {
                data.append(`Packages[${index}].PackageName`, pkg.packageName);
                data.append(`Packages[${index}].Price`, pkg.price.toString());
                if (pkg.discountPrice) data.append(`Packages[${index}].DiscountPrice`, pkg.discountPrice.toString());

                // Özəllikləri parçala
                const inclusionList = pkg.inclusions.split(/\n|,/).map((s: string) => s.trim()).filter((s: string) => s !== "");
                inclusionList.forEach((inc: string, incIndex: number) => {
                    data.append(`Packages[${index}].Inclusions[${incIndex}]`, inc);
                });
            });

            // API PUT Request
            await api.put(`/Tours/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("Tur uğurla yeniləndi!");
            router.push("/admin/tours");

        } catch (error) {
            console.error("Yeniləmə xətası:", error);
            alert("Xəta baş verdi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Yüklənir...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto pb-20">
            <Link href="/admin/tours" className="flex items-center text-gray-500 mb-6 hover:text-gray-900">
                <ArrowLeftIcon className="w-4 h-4 mr-1" /> Siyahıya qayıt
            </Link>

            <h1 className="text-2xl font-bold mb-8 text-gray-900">Turu Yenilə: {formData.title}</h1>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. ƏSAS MƏLUMATLAR */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4">Ümumi Məlumatlar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Turun Adı</label>
                            <input required type="text" className="w-full p-2 border rounded-lg"
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Məkan</label>
                            <input required type="text" className="w-full p-2 border rounded-lg"
                                value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Başlama Tarixi</label>
                            <input type="date" className="w-full p-2 border rounded-lg"
                                value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Gün Sayı</label>
                            <input required type="number" min="1" className="w-full p-2 border rounded-lg"
                                value={formData.durationDay} onChange={e => setFormData({ ...formData, durationDay: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Gecə Sayı</label>
                            <input required type="number" min="0" className="w-full p-2 border rounded-lg"
                                value={formData.durationNight} onChange={e => setFormData({ ...formData, durationNight: Number(e.target.value) })} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Açıqlama</label>
                            <textarea required rows={4} className="w-full p-2 border rounded-lg"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* 2. ŞƏKİLLƏR */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4">Şəkillər</h2>

                    {/* Mövcud Şəkillər */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {existingImages.map((img) => (
                            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border">
                                <Image src={img.url} alt="Tur şəkli" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteExistingImage(img.id)}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md transition"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Yeni Şəkil Yükləmə */}
                    <label className="block text-sm font-medium mb-2">Yeni Şəkillər Əlavə Et</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setNewFiles(e.target.files)}
                        className="w-full p-2 border border-dashed border-gray-300 rounded-lg"
                    />
                </div>

                {/* 3. PAKETLƏR */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Tur Paketləri</h2>
                        <button type="button" onClick={addPackage} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg flex items-center">
                            <PlusIcon className="w-4 h-4 mr-1" /> Paket Əlavə Et
                        </button>
                    </div>

                    <div className="space-y-6">
                        {packages.map((pkg, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                                <button
                                    type="button"
                                    onClick={() => removePackage(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-1 rounded"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">Paket Adı</label>
                                        <input type="text" placeholder="Məs: Ekonomik" className="w-full p-2 border rounded bg-white"
                                            value={pkg.packageName} onChange={e => handlePackageChange(index, 'packageName', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">Qiymət (AZN)</label>
                                        <input type="number" placeholder="0" className="w-full p-2 border rounded bg-white"
                                            value={pkg.price} onChange={e => handlePackageChange(index, 'price', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">Endirimli Qiymət</label>
                                        <input type="number" placeholder="0" className="w-full p-2 border rounded bg-white"
                                            value={pkg.discountPrice} onChange={e => handlePackageChange(index, 'discountPrice', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Daxil olanlar (Hər sətir yeni özəllik)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full p-2 border rounded bg-white"
                                        value={pkg.inclusions}
                                        onChange={e => handlePackageChange(index, 'inclusions', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href="/admin/tours" className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50">
                        Ləğv et
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {submitting ? "Yadda Saxlanılır..." : "Yadda Saxla"}
                    </button>
                </div>
            </form>
        </div>
    );
}