"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { PlusIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CreateTourPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // --- FORM DATA ---
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        durationDay: 1,
        durationNight: 0,
        startDate: "",
    });

    const [files, setFiles] = useState<FileList | null>(null);

    // --- PAKETLƏR MƏNTİQİ ---
    // Paketləri dinamik idarə edirik
    const [packages, setPackages] = useState([
        { packageName: "Ekonomik", price: "", discountPrice: "", inclusions: "" }
    ]);

    // Yeni paket əlavə etmək
    const addPackage = () => {
        setPackages([...packages, { packageName: "", price: "", discountPrice: "", inclusions: "" }]);
    };

    // Paketi silmək
    const removePackage = (index: number) => {
        const newPackages = [...packages];
        newPackages.splice(index, 1);
        setPackages(newPackages);
    };

    // Paket daxilində dəyişiklik
    const handlePackageChange = (index: number, field: string, value: string) => {
        const newPackages = [...packages];
        // @ts-ignore
        newPackages[index][field] = value;
        setPackages(newPackages);
    };

    // --- GÖNDƏRMƏ (SUBMIT) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Əsas məlumatlar
            data.append("Title", formData.title);
            data.append("Description", formData.description);
            data.append("Location", formData.location);
            data.append("DurationDay", formData.durationDay.toString());
            data.append("DurationNight", formData.durationNight.toString());
            if (formData.startDate) data.append("StartDate", formData.startDate);

            // Şəkillər
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    data.append("Files", files[i]);
                }
            }

            // Paketlər (Complex Object List mapping)
            packages.forEach((pkg, index) => {
                data.append(`Packages[${index}].PackageName`, pkg.packageName);
                data.append(`Packages[${index}].Price`, pkg.price);
                if (pkg.discountPrice) data.append(`Packages[${index}].DiscountPrice`, pkg.discountPrice);

                // Özəllikləri "vergül" və ya "yeni sətir" ilə ayırıb listə çeviririk
                const inclusionList = pkg.inclusions.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
                inclusionList.forEach((inc, incIndex) => {
                    data.append(`Packages[${index}].Inclusions[${incIndex}]`, inc);
                });
            });

            // API İstəyi (Multipart/Form-Data avtomatik gedəcək)
            await api.post("/Tours", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("Tur uğurla yaradıldı!");
            router.push("/admin/tours");

        } catch (error) {
            console.error("Yaratma xətası:", error);
            alert("Xəta baş verdi. Zəhmət olmasa məlumatları yoxlayın.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link href="/admin/tours" className="flex items-center text-gray-500 mb-6 hover:text-gray-900">
                <ArrowLeftIcon className="w-4 h-4 mr-1" /> Geriyə qayıt
            </Link>

            <h1 className="text-2xl font-bold mb-8 text-gray-900">Yeni Tur Yarat</h1>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* --- ƏSAS MƏLUMATLAR --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4">Əsas Məlumatlar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Turun Adı</label>
                            <input required type="text" className="w-full p-2 border rounded-lg"
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Məkan (Şəhər/Rayon)</label>
                            <input required type="text" className="w-full p-2 border rounded-lg"
                                value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Başlama Tarixi (Opsional)</label>
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

                {/* --- ŞƏKİLLƏR --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4">Şəkillər</h2>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        required
                        onChange={(e) => setFiles(e.target.files)}
                        className="w-full p-2 border border-dashed border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">Birdən çox şəkil seçə bilərsiniz.</p>
                </div>

                {/* --- PAKETLƏR --- */}
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
                                        <label className="text-xs font-bold uppercase text-gray-500">Endirimli Qiymət (Varsa)</label>
                                        <input type="number" placeholder="0" className="w-full p-2 border rounded bg-white"
                                            value={pkg.discountPrice} onChange={e => handlePackageChange(index, 'discountPrice', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Daxil olanlar (Hər sətirə birini yazın)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Nəqliyyat&#10;Səhər yeməyi&#10;Fotoçəkiliş"
                                        className="w-full p-2 border rounded bg-white"
                                        value={pkg.inclusions}
                                        onChange={e => handlePackageChange(index, 'inclusions', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- SUBMIT BUTTON --- */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? "Yaradılır..." : "Turu Yadda Saxla"}
                    </button>
                </div>
            </form>
        </div>
    );
}