"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"; // useEffect və jwtDecode sildik
import AuthModal from "./AuthModal";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
    const { user, logout } = useAuth(); // <--- Context-dən məlumatları alırıq
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const pathname = usePathname();

    const isActive = (path: string) =>
        pathname === path
            ? "text-primary font-bold"
            : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium";

    // --- LOGOUT (Artıq Context-dən gəlir) ---
    const handleLogoutClick = () => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[200px]">
                <span className="font-bold text-gray-800 text-center">
                    Hesabdan çıxmaq istəyirsiniz?
                </span>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
                    >
                        Xeyr
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            logout(); // <--- Context funksiyası
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                        Bəli, Çıx
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: "top-center",
            style: {
                background: '#fff',
                border: '1px solid #f3f4f6',
                padding: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderRadius: '16px',
            },
        });
    };

    return (
        <>
            <header className="bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-zinc-800 transition-colors duration-300">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">

                        {/* LOGO */}
                        <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-1 group">
                            <span className="text-primary group-hover:opacity-80 transition-opacity">Güvən</span>
                            <span className="text-[#333333] dark:text-white">Turizm</span>
                        </Link>

                        {/* MASAÜSTÜ MENÜ */}
                        <nav className="hidden md:flex space-x-8 items-center">
                            <Link href="/" className={`${isActive("/")} transition-colors`}>Əsas Səhifə</Link>
                            <Link href="/houses" className={`${isActive("/houses")} transition-colors`}>Evlərimiz</Link>
                            <Link href="/tours" className={`${isActive("/tours")} transition-colors`}>Turlar</Link>
                            <Link href="/about" className={`${isActive("/about")} transition-colors`}>Haqqımızda</Link>
                        </nav>

                        {/* --- SAĞ TƏRƏF --- */}
                        <div className="hidden md:flex items-center space-x-4">
                            <ThemeToggle />

                            {user ? ( // user obyekti varsa deməli giriş edilib
                                <div className="flex items-center gap-3">

                                    {/* ADMIN / PROFILE DÜYMƏSİ */}
                                    {user.role === "Admin" ? (
                                        <Link
                                            href="/admin"
                                            className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-all flex items-center gap-2"
                                        >
                                            <span>🛠️</span> Admin Panel
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/profile"
                                            className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-orange-600 transition-all flex items-center gap-2"
                                        >
                                            <span>👤</span> Profilim
                                        </Link>
                                    )}

                                    {/* KREATIV ÇIXIŞ İKONU */}
                                    <button
                                        onClick={handleLogoutClick}
                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 group"
                                        title="Çıxış et"
                                    >
                                        <svg
                                            className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>

                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsAuthOpen(true)}
                                        className="text-sm font-bold text-gray-600 hover:text-primary transition-colors px-2"
                                    >
                                        Giriş
                                    </button>
                                    <button
                                        onClick={() => setIsAuthOpen(true)}
                                        className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/30"
                                    >
                                        Qeydiyyat
                                    </button>
                                </>
                            )}

                        </div>

                        {/* MOBİL MENÜ BUTONU VE THEME TOGGLE */}
                        <div className="flex items-center gap-2 md:hidden">
                            <ThemeToggle />
                            <button
                                className="text-[#333333] dark:text-[#F3F4F6] focus:outline-none p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* MOBİL MENÜ İÇERİĞİ */}
                    {isOpen && (
                        <div className="md:hidden mt-4 pb-4 border-t border-gray-100 animate-fadeIn">
                            <div className="flex flex-col space-y-3 mt-4">

                                <Link href="/" className={`block px-4 py-2 rounded-lg ${isActive("/")}`} onClick={() => setIsOpen(false)}>Əsas Səhifə</Link>
                                <Link href="/houses" className={`block px-4 py-2 rounded-lg ${isActive("/houses")}`} onClick={() => setIsOpen(false)}>Evlərimiz</Link>
                                <Link href="/tours" className={`block px-4 py-2 rounded-lg ${isActive("/tours")}`} onClick={() => setIsOpen(false)}>Turlar</Link>
                                <Link href="/about" className={`block px-4 py-2 rounded-lg ${isActive("/about")}`} onClick={() => setIsOpen(false)}>Haqqımızda</Link>

                                <hr className="border-gray-100 my-2" />

                                <div className="flex flex-col gap-3 px-2">
                                    {user ? (
                                        <>
                                            {user.role === "Admin" ? (
                                                <Link href="/admin" onClick={() => setIsOpen(false)} className="bg-gray-900 text-white w-full text-center py-3 rounded-xl font-bold">Admin Panel</Link>
                                            ) : (
                                                <Link href="/profile" onClick={() => setIsOpen(false)} className="bg-primary text-white w-full text-center py-3 rounded-xl font-bold">Profilim</Link>
                                            )}
                                            <button onClick={handleLogoutClick} className="w-full text-center py-2 text-red-500 font-bold hover:bg-red-50 rounded-xl flex items-center justify-center gap-2">
                                                Çıxış
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setIsAuthOpen(true); setIsOpen(false); }} className="w-full text-center py-2 text-gray-600 font-bold hover:text-primary">Giriş</button>
                                            <button onClick={() => { setIsAuthOpen(true); setIsOpen(false); }} className="btn-primary w-full text-center py-3 rounded-xl font-bold">Qeydiyyat</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}