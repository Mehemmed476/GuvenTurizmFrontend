"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export default function FAQSection() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        api.get("/Common/faqs")
            .then(res => setFaqs(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (loading) return <div className="py-20 text-center text-gray-500">Suallar yüklənir...</div>;
    if (faqs.length === 0) return null;

    return (
        <section className="py-20 bg-gray-50 dark:bg-black transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Tez-tez Verilən <span className="text-primary">Suallar</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Sizi maraqlandıran sualların cavablarını burada tapa bilərsiniz.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className={`bg-white dark:bg-[#121212] rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === index ? "border-primary shadow-lg shadow-orange-100 dark:shadow-none" : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700"
                                }`}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                            >
                                <span className={`font-bold text-lg ${openIndex === index ? "text-primary" : "text-gray-800 dark:text-white"}`}>
                                    {faq.question}
                                </span>
                                <span className={`transform transition-transform duration-300 text-2xl ${openIndex === index ? "rotate-180 text-primary" : "text-gray-400"}`}>
                                    {openIndex === index ? "−" : "+"}
                                </span>
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="p-6 pt-0 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-dashed border-gray-100 dark:border-zinc-800 mt-2">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}