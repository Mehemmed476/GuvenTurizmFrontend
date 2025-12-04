import { Metadata } from "next";
import HouseDetailClient from "@/components/HouseDetailClient";

// Next.js 15-də Params tipi Promise olmalıdır
type Props = {
    params: Promise<{ id: string }>;
};

// SEO üçün Metadata generasiyası
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // ⚠️ DƏYİŞİKLİK: params-ı await edirik
    const { id } = await params;

    try {
        // Server tərəfdə sadə fetch
        const res = await fetch(`${API_URL}/Houses/${id}`);
        const house = await res.json();

        // Şəkil URL-ni düzəltmək
        const ogImage = house.coverImage.startsWith("http")
            ? house.coverImage
            : `${API_URL?.replace("/api", "")}/api/files/${house.coverImage}`;

        return {
            title: `${house.title} | Güvən Turizm`,
            description: house.description?.substring(0, 150) + "...",
            openGraph: {
                title: house.title,
                description: house.description?.substring(0, 150) + "...",
                images: [
                    {
                        url: ogImage,
                        width: 800,
                        height: 600,
                    },
                ],
            },
        };
    } catch (error) {
        return {
            title: "Ev Detalları | Güvən Turizm",
            description: "Qubada ən yaxşı günlük evlər.",
        };
    }
}

// Əsas Səhifə Komponenti (Server Component)
export default async function Page({ params }: Props) {
    // ⚠️ DƏYİŞİKLİK: params-ı await edirik
    const { id } = await params;

    return <HouseDetailClient id={id} />;
}