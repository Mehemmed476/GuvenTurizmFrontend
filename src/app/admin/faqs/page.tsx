"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    displayOrder: number;
    isActive: boolean;
}

export default function AdminFAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    // Form State
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);

    // Məlumatları gətir
    const fetchFaqs = async () => {
        try {
            const res = await api.get("/Common/faqs");
            setFaqs(res.data);
        } catch (error) {
            toast.error("Sualları yükləmək olmadı");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    // Modal Aç/Bağla
    const openModal = (faq?: FAQ) => {
        if (faq) {
            setEditingFaq(faq);
            setQuestion(faq.question);
            setAnswer(faq.answer);
            setDisplayOrder(faq.displayOrder);
        } else {
            setEditingFaq(null);
            setQuestion("");
            setAnswer("");
            setDisplayOrder(faqs.length + 1);
        }
        setIsModalOpen(true);
    };

    // Yadda Saxla (Create / Update)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { question, answer, displayOrder };

            if (editingFaq) {
                // Update
                await api.put("/Common/faqs", { ...payload, id: editingFaq.id, isActive: true });
                toast.success("Sual yeniləndi!");
            } else {
                // Create
                await api.post("/Common/faqs", payload);
                toast.success("Yeni sual yaradıldı!");
            }
            setIsModalOpen(false);
            fetchFaqs(); // Siyahını yenilə
        } catch (error) {
            toast.error("Xəta baş verdi.");
        }
    };

    // Sil
    const handleDelete = async (id: string) => {
        if (!confirm("Bu sualı silmək istədiyinizə əminsiniz?")) return;
        try {
            await api.delete(`/Common/faqs/${id}`);
            toast.success("Silindi.");
            setFaqs(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            toast.error("Silmək olmadı.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Suallar (FAQ)</h1>
                <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors">
                    + Yeni Sual
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Yüklənir...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-gray-600">Sıra</th>
                                <th className="p-4 font-bold text-gray-600">Sual</th>
                                <th className="p-4 font-bold text-gray-600">Cavab</th>
                                <th className="p-4 text-right font-bold text-gray-600">Əməliyyatlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {faqs.map((faq) => (
                                <tr key={faq.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 w-16 text-center font-bold text-gray-400">{faq.displayOrder}</td>
                                    <td className="p-4 font-bold text-gray-800 w-1/4">{faq.question}</td>
                                    <td className="p-4 text-gray-600 text-sm line-clamp-2">{faq.answer}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => openModal(faq)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg">✏️</button>
                                        <button onClick={() => handleDelete(faq.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">{editingFaq ? "Sualı Düzəlt" : "Yeni Sual"}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Sıra Nömrəsi</label>
                                <input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Sual</label>
                                <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Cavab</label>
                                <textarea value={answer} onChange={e => setAnswer(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl h-32" required />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl">Ləğv et</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-orange-600">Yadda Saxla</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}