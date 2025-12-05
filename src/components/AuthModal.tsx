"use client";

import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// 3 Rejim ola bilər: login, register, forgot
type AuthMode = "login" | "register" | "forgot";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { login } = useAuth();

    const [mode, setMode] = useState<AuthMode>("login"); // <--- Dəyişdi
    const [isLoading, setIsLoading] = useState(false);

    // Form Data
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [checkPassword, setCheckPassword] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // --- LOGIN ---
            if (mode === "login") {
                const response = await api.post("/Auths/login", { email, password, rememberMe: true });
                if (response.data.succeeded) {
                    login(response.data.token);
                    toast.success("Xoş gəldiniz! 👋");
                    onClose();
                } else {
                    toast.error(response.data.errors?.[0] || "Giriş uğursuz oldu.");
                }
            }
            // --- REGISTER ---
            else if (mode === "register") {
                if (password !== checkPassword) { toast.error("Şifrələr eyni deyil!"); setIsLoading(false); return; }

                const response = await api.post("/Auths/register", { userName, email, phoneNumber, password, checkPassword });
                if (response.data.succeeded) {
                    toast.success("Qeydiyyat uğurludur! Emailinizi təsdiqləyin.", { duration: 5000 });
                    setMode("login");
                } else {
                    toast.error(response.data.errors?.[0] || "Xəta");
                }
            }
            // --- FORGOT PASSWORD ---
            else if (mode === "forgot") {
                await api.post("/Auths/forgot-password", { email });
                toast.success("Sıfırlama linki emailinizə göndərildi! 📩");
                setMode("login");
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xəta baş verdi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative mx-4" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 p-2 rounded-full">✕</button>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
                    {mode === "login" && "Xoş Gəldiniz!"}
                    {mode === "register" && "Hesab Yarat"}
                    {mode === "forgot" && "Şifrəni Sıfırla"}
                </h2>
                <p className="text-gray-500 text-center mb-6 text-sm">
                    {mode === "login" && "Davam etmək üçün hesabınıza daxil olun."}
                    {mode === "register" && "Qubada istirahət üçün qeydiyyatdan keçin."}
                    {mode === "forgot" && "Emailinizi yazın, sizə link göndərək."}
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>

                    {/* REGISTER sahələri */}
                    {mode === "register" && (
                        <>
                            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="İstifadəçi Adı" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary" required />
                            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Telefon" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary" required />
                        </>
                    )}

                    {/* EMAIL (Hamısında var) */}
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email ünvanı" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary" required />

                    {/* PASSWORD sahələri (Forgot-da yoxdur) */}
                    {mode === "register" && (
                        <input type="password" value={password} onChange={(e) => setCheckPassword(e.target.value)} placeholder="Şifrə" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary" required />
                    )}
                    {mode !== "forgot" && (
                        <>
                            <input type="password" value={checkPassword} onChange={(e) => setPassword(e.target.value)} placeholder="Şifrəni təstiqlə" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary" required />
                            {mode === "register" && (
                                <p className="text-xs text-gray-500 mt-1">Şifrə ən az 8 rəqəmli olmalıdır. En az bir böyük hərf və bir xüsusi simvol olmalıdır</p>
                            )}
                        </>
                    )}


                    {/* Forgot Password Link */}
                    {mode === "login" && (
                        <div className="text-right">
                            <button type="button" onClick={() => setMode("forgot")} className="text-sm text-primary font-bold hover:underline">
                                Şifrəmi unutdum
                            </button>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 rounded-xl font-bold text-white shadow-lg mt-2 disabled:opacity-70">
                        {isLoading ? "Gözləyin..." : (mode === "login" ? "Daxil Ol" : mode === "register" ? "Qeydiyyatdan Keç" : "Link Göndər")}
                    </button>
                </form>

                {/* Alt Linklər */}
                <div className="mt-6 text-center text-gray-600 text-sm">
                    {mode === "login" && (
                        <p>Hesabınız yoxdur? <button onClick={() => setMode("register")} className="text-primary font-bold hover:underline">Qeydiyyat</button></p>
                    )}
                    {(mode === "register" || mode === "forgot") && (
                        <p>Artıq hesabınız var? <button onClick={() => setMode("login")} className="text-primary font-bold hover:underline">Daxil olun</button></p>
                    )}
                </div>
            </div>
        </div>
    );
}