import Skeleton from "./Skeleton";

export default function PropertyCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">

            {/* Şəkil Hissəsi */}
            <Skeleton className="h-60 w-full rounded-none" />

            {/* Məlumat Hissəsi */}
            <div className="p-5 flex flex-col flex-grow space-y-4">

                {/* Ünvan */}
                <Skeleton className="h-4 w-1/3" />

                {/* Başlıq */}
                <Skeleton className="h-7 w-3/4" />

                {/* Özəlliklər (Otaq və Yataq) */}
                <div className="flex gap-4 pb-2">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>

                {/* Buton */}
                <div className="mt-auto pt-2">
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}