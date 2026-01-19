"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { az } from "date-fns/locale";
import { format } from "date-fns";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import AuthModal, { AuthMode } from "@/components/AuthModal";
import Link from "next/link";
import { FaTimes, FaWhatsapp } from "react-icons/fa"; // X ikonu və Whatsapp ikonu

interface Booking {
    startDate: string;
    endDate: string;
    status: number;
}

interface BookingFormProps {
    houseId: string;
    price: number;
    existingBookings: Booking[];
    houseTitle: string; // YENİ: WhatsApp mesajı üçün
}

export default function BookingForm({ houseId, price, existingBookings, houseTitle }: BookingFormProps) {
    const { user } = useAuth();

    // Form Stateləri
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

    // Settings çək
    useState(() => {
        api.get("/Common/settings")
            .then(res => {
                if (res.data && res.data["Whatsapp"]) {
                    setWhatsappNumber(res.data["Whatsapp"]);
                } else if (res.data && res.data["PhoneNumber"]) {
                    // Fallback kimi adi nömrəni götürək, amma WhatsApp linki üçün təmizləmək lazımdır
                    setWhatsappNumber(res.data["PhoneNumber"]);
                }
            })
            .catch(err => console.error("Settings error:", err));
    });

    // Modal Stateləri
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>("login");

    // YENİ: Şərtlər Modalı üçün State
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

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

    // 1. İstifadəçi "Rezervasiya Et" butonuna basanda bu işləyir
    const handleInitialClick = () => {
        if (!user) {
            setAuthMode("register");
            setIsAuthModalOpen(true);
            return;
        }

        if (!startDate || !endDate) {
            toast.error("Zəhmət olmasa giriş və çıxış tarixlərini seçin.");
            return;
        }

        // Hər şey qaydasındadırsa, Şərtlər Modalını aç
        setIsTermsModalOpen(true);
    };

    // 2. İstifadəçi şərtləri qəbul edəndə bu işləyir (API Sorğusu)
    const confirmBooking = async () => {
        setIsTermsModalOpen(false); // Modalı bağla
        setLoading(true);

        try {
            const bookingData = {
                houseId: houseId,
                startDate: formatDateForBackend(startDate!),
                endDate: formatDateForBackend(endDate!),
                status: 0
            };

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
                onClick={handleInitialClick}
                disabled={loading}
                className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
            >
                {loading ? "Göndərilir..." : "Rezervasiya Et"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
                Sizdən hələlik heç bir ödəniş tutulmur.
            </p>

            {/* --- WHATSAPP BUTONU --- */}
            {/* --- WHATSAPP BUTONU --- */}
            {whatsappNumber && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => {
                            if (!startDate || !endDate) {
                                toast.error("Zəhmət olmasa, əvvəlcə giriş və çıxış tarixlərini seçin.");
                                return;
                            }
                            const text = `Salam, "${houseTitle}" evi üçün ${format(startDate, "dd.MM.yyyy")} - ${format(endDate, "dd.MM.yyyy")} tarixlərinə rezervasiya etmək istəyirəm. Ümumi qiymət: ${total} ₼.`;
                            const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
                            window.open(url, "_blank");
                        }}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-colors cursor-pointer"
                    >
                        <FaWhatsapp className="text-2xl" />
                        WhatsApp ilə Rezervasiya
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        {startDate && endDate
                            ? "Seçdiyiniz tarixlər və qiymət mesaja əlavə olunacaq"
                            : "Rezervasiya üçün tarixləri seçmək mütləqdir"}
                    </p>
                </div>
            )}

            {/* AuthModal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />

            {/* --- YENİ: ŞƏRTLƏR MODALI --- */}
            {isTermsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Şərtləri Təsdiqləyin</h3>
                            <button
                                onClick={() => setIsTermsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4">
                            <p>
                                Hörmətli <strong>{user?.userName || "Qonaq"}</strong>, rezervasiyanı tamamlamaq üçün aşağıdakı şərtləri qəbul etməlisiniz:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Giriş saatı 14:00, çıxış saatı 12:00-dır.</li>
                                <li>Evdə ziyan vurduğunuz əşyalar üçün məsuliyyət daşıyırsınız.</li>
                                <li>Rezervasiya yalnız ev sahibi təsdiqlədikdən sonra qüvvəyə minir.</li>
                                <li>Ləğv etmə qaydalarına riayət olunmalıdır.</li>
                            </ul>
                            <div className="pt-2 text-primary hover:underline">
                                <Link href="/terms" target="_blank">
                                    Tam qaydaları oxumaq üçün bura klikləyin.
                                </Link>
                            </div>
                        </div>

                        {/* Footer - Actions */}
                        <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                            <button
                                onClick={() => setIsTermsModalOpen(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                İmtina et
                            </button>
                            <button
                                onClick={confirmBooking}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                            >
                                Qəbul edirəm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}