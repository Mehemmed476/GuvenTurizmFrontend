"use client";

import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { az } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaBed, FaSearch } from "react-icons/fa"; // İkonlar varsa istifadə edək, yoxdursa SVG qalır

registerLocale("az", az);

export default function HeroSection() {
    const router = useRouter();

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [roomCount, setRoomCount] = useState("1");

    // --- AXTARIŞ FUNKSİYASI ---
    const handleSearch = () => {
        const params = new URLSearchParams();

        if (startDate) {
            params.append("startDate", startDate.toISOString());
        }
        if (endDate) {
            params.append("endDate", endDate.toISOString());
        }
        if (roomCount) {
            params.append("minRooms", roomCount);
        }

        router.push(`/houses?${params.toString()}`);
    };

    return (
        // DƏYİŞİKLİK 1: h-[85vh] əvəzinə min-h-[85vh] və py-24 (mobildə boşluq üçün)
        <div className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden py-24 md:py-0 bg-gray-900">

            {/* --- ARKA PLAN --- */}
            <div className="absolute inset-0 z-0">
                <img src="/banner.png" alt="Quba Mənzərə" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* --- İÇERİK --- */}
            <div className="relative z-10 container mx-auto px-4 text-center">

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                    Güvənlə Xəyalınızdakı <br />
                    <span className="text-primary">İstirahəti Yaşayın</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md px-4">
                    Meşənin sərinliyi, dağların əzəməti. Azərbaycanın ən gözəl
                    günlük kirayə evləri,kotecələri və turları sizi gözləyir.
                </p>

                {/* --- ARAMA KUTUSU --- */}
                <div className="bg-white p-4 rounded-3xl shadow-2xl max-w-5xl mx-auto flex flex-col md:flex-row items-end gap-4 animate-fadeIn z-20 relative">

                    {/* 1. Giriş Tarihi */}
                    <div className="flex-1 w-full text-left">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Giriş Tarixi</label>
                        <div className="relative w-full flex items-center">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                minDate={new Date()}
                                locale="az"
                                dateFormat="d MMM, yyyy"
                                placeholderText="Seçin"
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 text-gray-800 font-medium cursor-pointer"
                                wrapperClassName="w-full"
                            />
                            <div className="absolute right-4 text-gray-400 pointer-events-none">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* 2. Çıkış Tarihi */}
                    <div className="flex-1 w-full text-left">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Çıxış Tarixi</label>
                        <div className="relative w-full flex items-center">
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate || new Date()}
                                locale="az"
                                dateFormat="d MMM, yyyy"
                                placeholderText="Seçin"
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 text-gray-800 font-medium cursor-pointer"
                                wrapperClassName="w-full"
                            />
                            <div className="absolute right-4 text-gray-400 pointer-events-none">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* 3. Otaq Sayı */}
                    <div className="flex-1 w-full text-left">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Otaq Sayı</label>
                        <div className="relative w-full flex items-center">
                            <select
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 text-gray-800 font-medium appearance-none cursor-pointer"
                                value={roomCount}
                                onChange={(e) => setRoomCount(e.target.value)}
                            >
                                <option value="1">1 Otaqlı</option>
                                <option value="2">2 Otaqlı</option>
                                <option value="3">3 Otaqlı</option>
                                <option value="4">4+ Otaqlı</option>
                            </select>
                            <div className="absolute right-4 text-gray-400 pointer-events-none">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* 4. Arama Butonu */}
                    <button
                        onClick={handleSearch}
                        className="w-full md:w-auto btn-primary px-8 py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg h-[50px] mb-[1px] hover:shadow-xl transition-all active:scale-95"
                    >
                        <span>Axtar</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>

                {/* DƏYİŞİKLİK 2: Mətn mobilə uyğunlaşdırıldı */}
                <div className="mt-10 text-white/90 text-sm font-medium flex flex-wrap justify-center gap-3 px-2 leading-relaxed">
                    <span className="whitespace-nowrap">Qəçrəş</span>
                    <span className="hidden sm:inline text-white/50">•</span>
                    <span className="whitespace-nowrap">Təngəaltı</span>
                    <span className="hidden sm:inline text-white/50">•</span>
                    <span className="whitespace-nowrap">Xınalıq</span>
                    <span className="hidden sm:inline text-white/50">•</span>
                    <span className="whitespace-nowrap">Qırmızı Qəsəbə</span>
                </div>

            </div>
        </div>
    );
}