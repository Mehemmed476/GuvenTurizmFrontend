import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // DƏYİŞİKLİK: 'flex' istifadə edirik
        <div className="flex min-h-screen bg-gray-50">

            {/* Sidebar (Solda avtomatik yer tutacaq) */}
            <AdminSidebar />

            {/* Əsas Məzmun (Sağda qalan yeri tutacaq) */}
            <main className="flex-1 w-full transition-all duration-300">
                <div className="p-8">
                    {children}
                </div>
            </main>

        </div>
    );
}