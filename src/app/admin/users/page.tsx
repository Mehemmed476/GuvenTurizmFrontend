"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";

// --- TİPLƏR ---
interface User {
    id: string;
    userName: string;
    email: string;
    phoneNumber: string | null;
    emailConfirmed: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // --- MƏLUMATLARI ÇƏK ---
    const fetchUsers = async () => {
        try {
            const response = await api.get("/Users");
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error("Xəta:", error);
            toast.error("İstifadəçiləri yükləmək olmadı.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- AXTARIŞ ---
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = users.filter(u =>
            (u.userName?.toLowerCase() || "").includes(lowerTerm) ||
            (u.email?.toLowerCase() || "").includes(lowerTerm)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    // --- SİLMƏK ---
    const handleDelete = async (id: string) => {
        if (!confirm("Bu istifadəçini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.")) return;

        try {
            await api.delete(`/Users/${id}`);
            toast.success("İstifadəçi silindi.");

            // Siyahıdan dərhal çıxar (API-yə getmədən)
            const newStats = users.filter(u => u.id !== id);
            setUsers(newStats);

        } catch (error: any) {
            toast.error(error.response?.data || "Silinmədi.");
        }
    };

    if (isLoading) return <div className="p-10 text-center text-gray-500">Yüklənir...</div>;

    return (
        <div className="space-y-8 pb-20">

            {/* BAŞLIQ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">İstifadəçilər</h1>
                    <p className="text-gray-500 mt-1">Qeydiyyatdan keçən müştərilər</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold">
                    Cəmi: {users.length} nəfər
                </div>
            </div>

            {/* AXTARIŞ */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Ad və ya Email ilə axtar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {/* CƏDVƏL */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">İstifadəçi</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Əlaqə</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Əməliyyatlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">

                                    {/* İSTİFADƏÇİ */}
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                                {user.userName ? user.userName[0].toUpperCase() : "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{user.userName}</p>
                                                <p className="text-xs text-gray-400 font-mono">ID: {user.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* ƏLAQƏ */}
                                    <td className="p-5">
                                        <div className="flex flex-col gap-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">📧</span>
                                                <a href={`mailto:${user.email}`} className="text-gray-700 hover:text-primary transition-colors font-medium">
                                                    {user.email}
                                                </a>
                                            </div>
                                            {user.phoneNumber && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">📞</span>
                                                    <span className="text-gray-600">{user.phoneNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-5">
                                        {user.emailConfirmed ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                ✅ Təsdiqlənib
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                ⏳ Gözləyir
                                            </span>
                                        )}
                                    </td>

                                    {/* DÜYMƏLƏR */}
                                    <td className="p-5 text-right">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="İstifadəçini Sil"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">👥</div>
                            <h3 className="text-gray-900 font-bold text-lg">İstifadəçi Tapılmadı</h3>
                            <p className="text-gray-500 text-sm mt-1">Sistemdə bu kriteriyaya uyğun istifadəçi yoxdur.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}