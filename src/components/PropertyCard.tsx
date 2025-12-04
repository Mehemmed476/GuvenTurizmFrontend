import Link from "next/link";
import Image from "next/image"; // <--- IMPORT ET

interface HouseProps {
    id: number | string;
    title: string;
    address: string;
    price: number;
    roomCount: number;
    bedCount: number;
    imageUrl: string;
}

export default function PropertyCard({ id, title, address, price, roomCount, bedCount, imageUrl }: HouseProps) {
    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">

            {/* --- ŞƏKİL HİSSƏSİ --- */}
            <div className="relative h-60 w-full overflow-hidden">
                {/* YENİ IMAGE KOMPONENTİ */}
                <Image
                    src={imageUrl}
                    alt={title}
                    fill // <--- Şəkli konteynerə tam yayır
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Performans üçün vacibdir
                    priority={false} // Lazy load
                />

                {/* Üst Etiket */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1 z-10">
                    📍 Quba
                </div>

                {/* Qiymət Etiketi */}
                <div className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm z-10">
                    {price} ₼ <span className="font-normal text-white/80">/ gün</span>
                </div>
            </div>

            {/* --- MƏLUMAT HİSSƏSİ (Dəyişmədi) --- */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wide flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {address}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-1 group-hover:text-primary transition-colors">
                    {title}
                </h3>

                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg text-sm">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span className="font-medium">{roomCount} Otaq</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg text-sm">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="font-medium">{bedCount} Yataq</span>
                    </div>
                </div>

                <Link
                    href={`/houses/${id}`}
                    className="mt-auto w-full block text-center btn-primary py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all"
                >
                    Ətraflı Bax
                </Link>
            </div>
        </div>
    );
}