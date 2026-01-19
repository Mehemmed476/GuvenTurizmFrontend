import Link from "next/link";
import Image from "next/image";

// Backend'den gələn məlumatlara uyğun tip
interface TourProps {
    id: string;
    title: string;
    location: string;
    price: number;
    durationDay: number;
    durationNight: number;
    imageUrl: string;
}

export default function TourCard({ id, title, location, price, durationDay, durationNight, imageUrl }: TourProps) {
    return (
        <div className="group bg-white dark:bg-[#121212] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col h-full">

            {/* --- ŞƏKİL HİSSƏSİ --- */}
            <div className="relative h-60 w-full overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Sol Üst Etiket - Lokasiya */}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm flex items-center gap-1 z-10">
                    📍 {location}
                </div>

                {/* Sağ Alt Etiket - Qiymət */}
                <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm z-10">
                    {price} ₼ <span className="font-normal text-white/80">/ başlayır</span>
                </div>
            </div>

            {/* --- MƏLUMAT HİSSƏSİ --- */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Müddət */}
                <div className="text-xs text-blue-500 mb-2 uppercase font-semibold tracking-wide flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {durationDay} Gün / {durationNight} Gecə
                </div>

                {/* Başlıq */}
                <h3 className="text-lg font-bold text-[#333333] dark:text-[#F3F4F6] mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                {/* Düymə */}
                <Link
                    href={`/tours/${id}`}
                    className="mt-auto w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                    Ətraflı Bax
                </Link>
            </div>
        </div>
    );
}