"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", path: "/admin", icon: "📊" },
        { name: "Evlər", path: "/admin/houses", icon: "🏠" },
        { name: "Rezervasiyalar", path: "/admin/bookings", icon: "📅" },
        { name: "İstifadəçilər", path: "/admin/users", icon: "👥" },
        { name: "Ayarlar", path: "/admin/settings", icon: "⚙️" },
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white">
                    Güvən<span className="text-primary">Panel</span>
                </h2>
            </div>

            {/* Menyu */}
            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? "bg-primary text-white font-bold shadow-lg shadow-orange-500/20"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Çıxış */}
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-gray-800 rounded-xl transition-all">
                    <span>🚪</span>
                    <span>Çıxış Et</span>
                </button>
            </div>
        </aside>
    );
}