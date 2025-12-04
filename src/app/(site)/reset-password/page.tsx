"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Şifrələr eyni deyil!");
            return;
        }
        setLoading(true);

        try {
            await api.post("/Auths/reset-password", {
                email,
                token,
                newPassword: password,
                confirmPassword: confirmPassword
            });

            toast.success("Şifrəniz uğurla yeniləndi! İndi giriş edə bilərsiniz. 🎉");
            router.push("/"); // Ana səhifəyə (və ya login modalına) at

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.errors?.[0] || "Xəta baş verdi. Linkin vaxtı bitmiş ola bilər.");
        } finally {
            setLoading(false);
        }
    };

    if (!email || !token) {
        return <div className="text-center py-20 text-red-500">Yanlış və ya yararsız link.</div>;
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 bg-gray-50">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Yeni Şifrə Təyin Edin</h2>
                <p className="text-gray-500 text-center mb-6 text-sm">Zəhmət olmasa hesabınız üçün yeni şifrə daxil edin.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Yeni Şifrə</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary"
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Şifrəni Təsdiqlə</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary"
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl font-bold text-white shadow-lg mt-4 disabled:opacity-70"
                    >
                        {loading ? "Yenilənir..." : "Şifrəni Yenilə"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Yüklənir...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}