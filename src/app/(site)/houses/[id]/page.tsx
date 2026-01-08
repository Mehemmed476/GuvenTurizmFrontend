import { Metadata } from "next";
import HouseDetailClient from "@/components/HouseDetailClient";

// Next.js 15-də Params tipi Promise olmalıdır
type Props = {
    params: Promise<{ id: string }>;
};

// SEO üçün Metadata generasiyası
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // ⚠️ DƏYİŞİKLİK: params-ı await edirik
    const { id } = await params;

    try {
        // ⚠️ DƏYİŞİKLİK: Fetch URL-i də hardcoded etdik ki, serverdə xəta verməsin
        const res = await fetch(`https://api.guventurizm.az/api/Houses/${id}`);
        const house = await res.json();

        // ⚠️ DƏYİŞİKLİK: Şəkil URL-ni birbaşa saytın adından götürürük
        const ogImage = house.coverImage.startsWith("http")
            ? house.coverImage
            : `https://api.guventurizm.az/api/files/${house.coverImage}`;

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