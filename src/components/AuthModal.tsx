"use client";

import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast"; // <--- 1. Import etdik

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [checkPassword, setCheckPassword] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLoginMode) {
                // --- LOGIN ---
                const response = await api.post("/Auths/login", {
                    email,
                    password,
                    rememberMe: true
                });

                if (response.data.succeeded) {
                    localStorage.setItem("accessToken", response.data.token);

                    // alert əvəzinə toast
                    toast.success("Xoş gəldiniz! 👋");

                    onClose();
                    setTimeout(() => window.location.reload(), 1000); // 1 saniyə sonra yenilə
                } else {
                    toast.error(response.data.errors?.[0] || "Giriş uğursuz oldu.");
                }

            } else {
                // --- REGISTER ---
                if (password !== checkPassword) {
                    toast.error("Şifrələr eyni deyil!");
                    setIsLoading(false);
                    return;
                }

                const response = await api.post("/Auths/register", {
                    userName,
                    email,
                    password,
                    checkPassword
                });

                if (response.data.succeeded) {
                    toast.success("Qeydiyyat uğurludur! İndi giriş edin. 🎉");
                    setIsLoginMode(true);
                } else {
                    toast.error(response.data.errors?.[0] || "Qeydiyyat xətası");
                }
            }
        } catch (error: any) {
            console.error("Auth Error:", error);
            toast.error(error.response?.data?.message || "Xəta baş verdi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 p-2 rounded-full"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
                    {isLoginMode ? "Xoş Gəldiniz!" : "Hesab Yarat"}
                </h2>
                <p className="text-gray-500 text-center mb-8">
                    {isLoginMode
                        ? "Davam etmək üçün hesabınıza daxil olun."
                        : "Qubada istirahət üçün indi qeydiyyatdan keçin."}
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLoginMode && (
                        <div className="animate-fadeIn">
                            <label className="block text-sm font-bold text-gray-700 mb-1">İstifadəçi Adı</label>
                            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Məs: ali_mammadov" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required={!isLoginMode} />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email ünvanı</label>
                        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mail@numune.az" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Şifrə</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required />
                    </div>
                    {!isLoginMode && (
                        <div className="animate-fadeIn">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Şifrəni Təsdiqlə</label>
                            <input type="password" value={checkPassword} onChange={(e) => setCheckPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required={!isLoginMode} />
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 rounded-xl font-bold text-white shadow-lg text-lg mt-2 disabled:opacity-70 flex justify-center">
                        {isLoading ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : (isLoginMode ? "Daxil Ol" : "Qeydiyyatdan Keç")}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-600">
                    {isLoginMode ? "Hesabınız yoxdur?" : "Artıq hesabınız var?"}
                    <button onClick={() => setIsLoginMode(!isLoginMode)} className="ml-2 font-bold text-primary hover:underline">
                        {isLoginMode ? "Qeydiyyatdan keçin" : "Daxil olun"}
                    </button>
                </div>
            </div>
        </div>
    );
}