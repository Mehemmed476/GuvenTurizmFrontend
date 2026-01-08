"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    const menuItems = [
        { name: "Dashboard", path: "/admin", icon: "📊" },
        { name: "Evlər", path: "/admin/houses", icon: "🏠" },
        { name: "Turlar", path: "/admin/tours", icon: "🌍" },
        { name: "Rezervasiyalar", path: "/admin/bookings", icon: "📅" },
        { name: "Suallar (FAQ)", path: "/admin/faqs", icon: "❓" },
        { name: "İstifadəçilər", path: "/admin/users", icon: "👥" },
        { name: "Tənzimləmələr", path: "/admin/settings", icon: "⚙️" },
    ];

    return (
        // DƏYİŞİKLİK: 'fixed' əvəzinə 'sticky top-0 h-screen shrink-0'
        <aside className="w-72 bg-[#0f172a] text-white h-screen sticky top-0 flex flex-col shrink-0 border-r border-gray-800 shadow-2xl z-40">

            {/* LOGO */}
            <div className="p-8 pb-4">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                        G
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                            Güvən Turizm
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* MENU */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium group ${active
                                ? "bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg shadow-orange-500/25 translate-x-1"
                                : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
                                }`}
                        >
                            <span className={`text-xl transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                            <span>{item.name}</span>
                            {active && <span className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-pulse"></span>}
                        </Link>
                    );
                })}
            </nav>

            {/* BOTTOM */}
            <div className="p-4 border-t border-gray-800">
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">🌐</div>
                        <div>
                            <p className="text-sm font-bold text-white">Vebsayt</p>
                            <p className="text-xs text-gray-400">Canlı görünüşə keç</p>
                        </div>
                    </div>
                    <Link href="/" className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-all shadow-md group">
                        <span className="group-hover:-translate-x-1 transition-transform">⬅️</span>
                        Sayta Qayıt
                    </Link>
                </div>
                <p className="text-center text-[10px] text-gray-600 mt-4 font-medium">© 2025 Güvən Turizm v1.0</p>
            </div>
        </aside>
    );
}