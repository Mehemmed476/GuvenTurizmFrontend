"use client";

import { useState } from "react";

// Gələcəkdə Backend-dən gələcək Model (Entity)
interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

// Admin paneldən dəyişdiriləcək datalar (Simulyasiya)
const faqData: FAQItem[] = [
    {
        id: 1,
        question: "Evləri necə rezervasiya edə bilərəm?",
        answer: "Bəyəndiyiniz evi seçdikdən sonra 'Rezervasiya et' düyməsinə basaraq, tarix və qonaq sayını qeyd edib ödəniş edə bilərsiniz. Təsdiq mesajı dərhal emailinizə göndəriləcək."
    },
    {
        id: 2,
        question: "Giriş və çıxış saatları neçədədir?",
        answer: "Standart giriş vaxtı (Check-in) 14:00, çıxış vaxtı (Check-out) isə 12:00-dır. Erkən giriş və ya gec çıxış üçün əvvəlcədən ev sahibi ilə əlaqə saxlamağınız xahiş olunur."
    },
    {
        id: 3,
        question: "Ödənişi geri qaytarmaq mümkündür?",
        answer: "Giriş tarixindən 48 saat əvvələ qədər edilən ləğvlərdə ödəniş tam geri qaytarılır. 48 saatdan az qaldıqda isə yalnız 50% geri ödənilir."
    },
    {
        id: 4,
        question: "Evlərdə internet (Wi-Fi) varmı?",
        answer: "Bəli, Qubadakı bütün evlərimizdə yüksək sürətli fiber-optik internet mövcuddur."
    },
    {
        id: 5,
        question: "Ev heyvanları ilə gəlmək olar?",
        answer: "Bəzi evlərimiz ev heyvanı dostudur, bəziləri isə yox. Zəhmət olmasa evin detallarına baxarkən 'Ev heyvanlarına icazə verilir' işarəsinə diqqət yetirin."
    }
];

export default function FAQSection() {
    // Hansı sualın açıq olduğunu tutan state (null = hamısı bağlı)
    const [openId, setOpenId] = useState<number | null>(null);

    const toggleFAQ = (id: number) => {
        // Əgər basılan sual artıq açıqdırsa bağla, deyilsə onu aç
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Başlıq */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        Tez-tez Verilən <span className="text-primary">Suallar</span>
                    </h2>
                    <p className="text-gray-500">
                        Ağlınızdakı suallara ən qısa zamanda cavab tapın.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                    {faqData.map((item) => (
                        <div
                            key={item.id}
                            className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 ${openId === item.id ? 'shadow-md border-primary/30 bg-orange-50/30' : 'hover:border-gray-300'}`}
                        >
                            {/* Sual Hissəsi (Kliklənə bilən) */}
                            <button
                                onClick={() => toggleFAQ(item.id)}
                                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                            >
                                <span className={`text-lg font-bold transition-colors ${openId === item.id ? 'text-primary' : 'text-gray-800'}`}>
                                    {item.question}
                                </span>

                                {/* Ox İşarəsi (Fırlanan) */}
                                <span className={`ml-4 flex-shrink-0 transition-transform duration-300 ${openId === item.id ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>

                            {/* Cavab Hissəsi (Açılıb/Bağlanan) */}
                            <div
                                className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${openId === item.id ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <p className="text-gray-600 leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}