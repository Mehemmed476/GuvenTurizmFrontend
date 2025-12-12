"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { az } from "date-fns/locale";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext"; // <--- IMPORT ƏLAVƏ EDİLDİ

interface Booking {
    startDate: string;
    endDate: string;
    status: number;
}

interface BookingFormProps {
    houseId: string;
    price: number;
    existingBookings: Booking[];
}

export default function BookingForm({ houseId, price, existingBookings }: BookingFormProps) {
    const { user } = useAuth(); // <--- User məlumatını context-dən alırıq
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

    const formatDateForBackend = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const excludeDateIntervals = existingBookings
        .filter(b => b.status !== 2)
        .map((booking) => ({
            start: new Date(booking.startDate),
            end: new Date(booking.endDate),
        }));

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * price;
    };

    const total = calculateTotal();
    const days = total > 0 ? total / price : 0;

    const handleBooking = async () => {
        // DƏYİŞİKLİK: localStorage yerinə Context-dəki user-i yoxlayırıq
        if (!user) {
            toast.error("Rezervasiya etmək üçün əvvəlcə giriş etməlisiniz!");
            return;
        }

        if (!startDate || !endDate) {
            toast.error("Zəhmət olmasa giriş və çıxış tarixlərini seçin.");
            return;
        }

        setLoading(true);

        try {
            const bookingData = {
                houseId: houseId,
                startDate: formatDateForBackend(startDate),
                endDate: formatDateForBackend(endDate),
                status: 0
            };

            // Token avtomatik olaraq api.ts tərəfindən cookie-dən oxunub header-ə qoyulacaq
            await api.post("/Bookings", bookingData);

            toast.success("Rezervasiya sorğunuz göndərildi! Təsdiq gözlənilir. 🎉");
            setStartDate(null);
            setEndDate(null);

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Xəta baş verdi.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">

            <div className="flex justify-between items-end mb-6">
                <div>
                    <span className="text-3xl font-bold text-gray-900">{price} ₼</span>
                    <span className="text-gray-500"> / gecə</span>
                </div>
            </div>

            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
                <div className="flex border-b border-gray-200">

                    {/* GİRİŞ TARİXİ */}
                    <div className="w-1/2 p-3 border-r border-gray-200">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Giriş</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            minDate={new Date()}
                            excludeDateIntervals={excludeDateIntervals}
                            locale={az}
                            dateFormat="dd MMMM yyyy"
                            placeholderText="Seçin"
                            className="w-full outline-none text-gray-700 font-medium bg-transparent text-sm cursor-pointer"
                            onFocus={(e) => e.target.blur()}
                        />
                    </div>

                    {/* ÇIXIŞ TARİXİ */}
                    <div className="w-1/2 p-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Çıxış</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate || new Date()}
                            excludeDateIntervals={excludeDateIntervals}
                            locale={az}
                            dateFormat="dd MMMM yyyy"
                            placeholderText="Seçin"
                            className="w-full outline-none text-gray-700 font-medium bg-transparent text-sm cursor-pointer"
                            onFocus={(e) => e.target.blur()}
                        />
                    </div>
                </div>
            </div>

            {total > 0 && (
                <div className="space-y-3 mb-6 text-gray-600 text-sm animate-fadeIn">
                    <div className="flex justify-between">
                        <span className="underline">{price} ₼ x {days} gecə</span>
                        <span>{total} ₼</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                        <span>Cəmi</span>
                        <span>{total} ₼</span>
                    </div>
                </div>
            )}

            <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
            >
                {loading ? (
                    <>Göndərilir...</>
                ) : (
                    "Rezervasiya Et"
                )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
                Sizdən hələlik heç bir ödəniş tutulmur.
            </p>
        </div>
    );
}