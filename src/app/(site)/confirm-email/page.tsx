"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";

function ConfirmEmailContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!userId || !token) {
            setStatus("error");
            return;
        }

        // Backend-ə sorğu göndər
        api.post(`/Auths/confirm-email?userId=${userId}&token=${encodeURIComponent(token)}`)
            .then(() => setStatus("success"))
            .catch(() => setStatus("error"));
    }, [userId, token]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            {status === "loading" && (
                <>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Email təsdiqlənir...</h2>
                    <p className="text-gray-500 mt-2">Zəhmət olmasa gözləyin.</p>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Təbrik edirik!</h2>
                    <p className="text-gray-600 mb-8">Email ünvanınız uğurla təsdiqləndi.</p>
                    <Link href="/" className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg">
                        Ana Səhifəyə Qayıt
                    </Link>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Xəta Baş Verdi</h2>
                    <p className="text-gray-500 mb-8">Link yanlışdır və ya vaxtı bitib.</p>
                    <Link href="/" className="text-primary font-bold hover:underline">
                        Ana Səhifə
                    </Link>
                </>
            )}
        </div>
    );
}

export default function ConfirmEmailPage() {
    return (
        <Suspense fallback={<div>Yüklənir...</div>}>
            <ConfirmEmailContent />
        </Suspense>
    );
}