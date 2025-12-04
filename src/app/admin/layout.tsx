import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sol Tərəf: Sabit Menyu */}
            <AdminSidebar />

            {/* Sağ Tərəf: Məzmun */}
            <div className="flex-1 ml-64">
                {/* Admin Header (Sadə) */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
                    <h2 className="font-bold text-gray-700">İdarəetmə Paneli</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                            A
                        </div>
                        <span className="text-sm font-medium">Admin</span>
                    </div>
                </header>

                {/* Səhifə Məzmunu */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}