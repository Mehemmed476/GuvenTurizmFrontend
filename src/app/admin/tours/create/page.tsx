"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api, { uploadConfig } from "@/services/api";
import { PlusIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CreateTourPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Paketlər dinamik olduğu üçün State lazımdır
    const [packages, setPackages] = useState([
        { packageName: "Ekonomik", price: "", discountPrice: "", inclusions: "" }
    ]);

    // --- PAKET FUNKSİYALARI ---
    const addPackage = () => {
        setPackages([...packages, { packageName: "", price: "", discountPrice: "", inclusions: "" }]);
    };

    const removePackage = (index: number) => {
        if (packages.length === 1) return; // Ən az bir paket qalsın
        const newPackages = [...packages];
        newPackages.splice(index, 1);
        setPackages(newPackages);
    };

    const handlePackageChange = (index: number, field: string, value: string) => {
        const newPackages = [...packages];
        // @ts-ignore
        newPackages[index][field] = value;
        setPackages(newPackages);
    };

    // --- GÖNDƏRMƏ (SUBMIT) ---
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        try {
            // Formdakı standart inputları (Title, Location, Files və s.) avtomatik götürür
            const formData = new FormData(event.currentTarget);

            // Paketləri FormData-ya əlavə edirik (Backend bu formatı gözləyir: Packages[0].Price)
            packages.forEach((pkg, index) => {
                formData.append(`Packages[${index}].PackageName`, pkg.packageName);
                formData.append(`Packages[${index}].Price`, pkg.price || "0");

                if (pkg.discountPrice) {
                    formData.append(`Packages[${index}].DiscountPrice`, pkg.discountPrice);
                }

                // Özəllikləri ayırıb tək-tək əlavə edirik
                const inclusionList = pkg.inclusions.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
                inclusionList.forEach((inc, incIndex) => {
                    formData.append(`Packages[${index}].Inclusions[${incIndex}]`, inc);
                });
            });

            // API Sorğusu
            const response = await api.post("/Tours", formData, uploadConfig);

            if (response.status === 200 || response.status === 201) {
                alert("Tur uğurla yaradıldı! 🎉");
                router.push("/admin/tours");
            }

        } catch (error: any) {
            console.error("Xəta:", error);
            const message = error.response?.data?.title || "Xəta baş verdi";
            alert("Xəta: " + message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Başlıq və Geri Düyməsi */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/tours" className="text-gray-500 hover:text-gray-900 text-2xl">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Yeni Tur Yarat</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">

                {/* --- BÖLMƏ 1: Əsas Məlumatlar --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="font-bold block mb-2 text-gray-700">Turun Adı (Title)</label>
                        <input name="Title" required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" placeholder="Məs: Qəbələ Tufandağ Turu" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Məkan (Location)</label>
                        <input name="Location" required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" placeholder="Məs: Qəbələ" />
                    </div>
                    <div>
                        <label className="font-bold block mb-2 text-gray-700">Başlama Tarixi</label>
                        <input name="StartDate" type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="font-bold block mb-2 text-gray-700">Təsvir (Description)</label>
                        <textarea name="Description" required rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" placeholder="Tur haqqında ətraflı məlumat..."></textarea>
                    </div>
                </div>

                {/* --- BÖLMƏ 2: Müddət --- */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Müddət</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-bold block mb-2 text-gray-700">Gün Sayı</label>
                            <input name="DurationDay" required type="number" min="1" defaultValue={1} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="font-bold block mb-2 text-gray-700">Gecə Sayı</label>
                            <input name="DurationNight" required type="number" min="0" defaultValue={0} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                        </div>
                    </div>
                </div>

                {/* --- BÖLMƏ 3: Şəkillər --- */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Şəkillər</h3>
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-xl text-center hover:bg-gray-100 transition-colors">
                        <label className="block mb-2 text-sm text-gray-500 font-semibold">Tura aid şəkilləri seçin</label>
                        <input
                            name="Files"
                            type="file"
                            multiple
                            accept="image/*"
                            required
                            className="w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-600"
                        />
                    </div>
                </div>

                {/* --- BÖLMƏ 4: Paketlər (Dinamik) --- */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold text-gray-900">Tur Paketləri</h3>
                        <button type="button" onClick={addPackage} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg flex items-center font-medium transition-colors">
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
                                            placeholder="Məs: Ekonomik"
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
                                            placeholder="0"
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
                                            placeholder="Opsional"
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
                        {isLoading ? "Yaradılır..." : "Turu Yadda Saxla"}
                    </button>
                </div>

            </form>
        </div>
    );
}