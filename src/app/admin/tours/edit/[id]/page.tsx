"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import api, { uploadConfig } from "@/services/api";
import { ArrowLeftIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import toast from "react-hot-toast";

// --- TİPLƏR ---
interface TourFile {
    id: string;
    path: string; // Backend-dən gələn ad 'path' ola bilər
}

interface TourPackage {
    packageName: string;
    price: number | "";
    discountPrice: number | "";
    inclusions: string; // String kimi saxlayırıq (textarea üçün)
}

export default function EditTourPage() {
    const router = useRouter();
    const { id } = useParams();
    const tourId = id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // --- FORM STATE-LƏRİ ---
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [durationDay, setDurationDay] = useState<number | "">(1);
    const [durationNight, setDurationNight] = useState<number | "">(0);
    const [startDate, setStartDate] = useState("");

    // Şəkil State-ləri
    const [existingImages, setExistingImages] = useState<TourFile[]>([]); // Serverdəki şəkillər
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Silinəcək şəkillərin ID-ləri
    const [newFiles, setNewFiles] = useState<FileList | null>(null); // Yeni yüklənən fayllar

    // Paket State-i
    const [packages, setPackages] = useState<TourPackage[]>([
        { packageName: "", price: "", discountPrice: "", inclusions: "" }
    ]);

    // --- URL HELPER ---
    const getImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
        return `${baseUrl}/api/files/${path}`;
    };

    // --- DATALARI YÜKLƏ ---
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await api.get(`/Tours/${tourId}`);
                const data = response.data;

                // Formu doldur
                setTitle(data.title || "");
                setDescription(data.description || "");
                setLocation(data.location || "");
                setDurationDay(data.durationDay || 1);
                setDurationNight(data.durationNight || 0);
                setStartDate(data.startDate ? data.startDate.split('T')[0] : "");

                // Şəkilləri ayarla
                if (data.tourFiles && data.tourFiles.length > 0) {
                    setExistingImages(data.tourFiles);
                }

                // Paketləri ayarla
                if (data.packages) {
                    const formattedPackages = data.packages.map((p: any) => {
                        // Inclusions array gələrsə string-ə çeviririk
                        let inclusionsText = "";
                        if (Array.isArray(p.inclusions)) {
                            inclusionsText = p.inclusions
                                .map((inc: any) => (typeof inc === 'object' ? inc.description : inc))
                                .join("\n");
                        } else {
                            inclusionsText = p.inclusions || "";
                        }

                        return {
                            packageName: p.packageName,
                            price: p.price,
                            discountPrice: p.discountPrice || "",
                            inclusions: inclusionsText
                        };
                    });
                    setPackages(formattedPackages);
                }

            } catch (error) {
                console.error("Tur məlumatları alınmadı:", error);
                toast.error("Tur tapılmadı.");
                router.push("/admin/tours");
            } finally {
                setDataLoading(false);
            }
        };

        if (tourId) fetchTour();
    }, [tourId, router]);

    // --- PAKET FUNKSİYALARI ---
    const addPackage = () => {
        setPackages([...packages, { packageName: "", price: "", discountPrice: "", inclusions: "" }]);
    };

    const removePackage = (index: number) => {
        const newPackages = [...packages];
        newPackages.splice(index, 1);
        setPackages(newPackages);
    };

    const handlePackageChange = (index: number, field: keyof TourPackage, value: string | number) => {
        const newPackages = [...packages];
        // @ts-ignore
        newPackages[index][field] = value;
        setPackages(newPackages);
    };

    // --- ŞƏKİL SİLMƏ ---
    const handleDeleteExistingImage = (imgId: string) => {
        if (!confirm("Bu şəkli silmək istədiyinizə əminsiniz? (Yadda saxla basanda silinəcək)")) return;

        // UI-dan gizlət
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
        // Silinəcəklər siyahısına at
        setImagesToDelete(prev => [...prev, imgId]);
    };

    // --- SUBMIT (YENİLƏMƏ) ---
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();

            // Əsas Məlumatlar
            formData.append("Title", title);
            formData.append("Description", description);
            formData.append("Location", location);
            formData.append("DurationDay", durationDay.toString());
            formData.append("DurationNight", durationNight.toString());
            if (startDate) formData.append("StartDate", startDate);

            // Silinəcək şəkillər
            imagesToDelete.forEach((imgId, index) => {
                formData.append(`ImageIdsToDelete[${index}]`, imgId);
            });

            // Yeni şəkillər
            if (newFiles) {
                for (let i = 0; i < newFiles.length; i++) {
                    formData.append("NewImages", newFiles[i]);
                }
            }

            // Paketlər
            packages.forEach((pkg, index) => {
                formData.append(`Packages[${index}].PackageName`, pkg.packageName);
                formData.append(`Packages[${index}].Price`, pkg.price.toString());
                if (pkg.discountPrice) formData.append(`Packages[${index}].DiscountPrice`, pkg.discountPrice.toString());

                // Özəllikləri parçala
                const inclusionList = pkg.inclusions.split(/\n|,/).map((s: string) => s.trim()).filter((s: string) => s !== "");
                inclusionList.forEach((inc: string, incIndex: number) => {
                    formData.append(`Packages[${index}].Inclusions[${incIndex}]`, inc);
                });
            });

            // API PUT Request
            await api.put(`/Tours/${tourId}`, formData, uploadConfig);

            toast.success("Tur uğurla yeniləndi!");
            router.push("/admin/tours");

        } catch (error: any) {
            console.error("Yeniləmə xətası:", error);
            const msg = error.response?.data?.message || "Xəta baş verdi.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (dataLoading) return <div className="p-20 text-center">Yüklənir...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Başlıq və Geri Düyməsi */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/tours" className="text-gray-500 hover:text-gray-900 text-2xl">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Turu Yenilə</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">

                {/* --- 1. ƏSAS MƏLUMATLAR --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="font-bold block mb-2 text-gray-700">Turun Adı</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Məkan (Şəhər/Rayon)</label>
                        <input value={location} onChange={e => setLocation(e.target.value)} required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Başlama Tarixi</label>
                        <input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Gün Sayı</label>
                        <input value={durationDay} onChange={e => setDurationDay(Number(e.target.value))} required type="number" min="1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Gecə Sayı</label>
                        <input value={durationNight} onChange={e => setDurationNight(Number(e.target.value))} required type="number" min="0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="font-bold block mb-2 text-gray-700">Açıqlama</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                </div>

                {/* --- 2. ŞƏKİLLƏR --- */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Şəkillər</h3>

                    {/* Mövcud Şəkillər */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {existingImages.map((img) => (
                            <div key={img.id} className="relative group aspect-square">
                                <img src={getImageUrl(img.path)} alt="Tour" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteExistingImage(img.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                    title="Sil"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Yeni Şəkil Yükləmə */}
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Yeni Şəkillər Əlavə Et</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setNewFiles(e.target.files)}
                            className="w-full p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-600"
                        />
                    </div>
                </div>

                {/* --- 3. PAKETLƏR --- */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Tur Paketləri</h3>
                        <button type="button" onClick={addPackage} className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center font-medium transition-colors">
                            <PlusIcon className="w-4 h-4 mr-1" /> Paket Əlavə Et
                        </button>
                    </div>

                    <div className="space-y-6">
                        {packages.map((pkg, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200 relative group hover:border-primary/30 transition-all">
                                <button
                                    type="button"
                                    onClick={() => removePackage(index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    title="Paketi Sil"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Paket Adı</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary"
                                            value={pkg.packageName}
                                            onChange={e => handlePackageChange(index, 'packageName', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Qiymət (AZN)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary"
                                            value={pkg.price}
                                            onChange={e => handlePackageChange(index, 'price', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Endirimli Qiymət</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary"
                                            value={pkg.discountPrice}
                                            onChange={e => handlePackageChange(index, 'discountPrice', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Daxil olanlar (Yeni sətirlə yazın)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Nəqliyyat&#10;Səhər yeməyi&#10;Fotoçəkiliş"
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary"
                                        value={pkg.inclusions}
                                        onChange={e => handlePackageChange(index, 'inclusions', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- DÜYMƏLƏR --- */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                    <Link href="/admin/tours" className="px-6 py-3 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors">
                        Ləğv et
                    </Link>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? "Yenilənir..." : "Yadda Saxla"}
                    </button>
                </div>

            </form>
        </div>
    );
}