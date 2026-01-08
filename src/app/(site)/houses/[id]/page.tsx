import { Metadata } from "next";
import HouseDetailClient from "@/components/HouseDetailClient";

type Props = {
    params: Promise<{ id: string }>;
};

// --- SEO GENERATION ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    // 1. Sadə başlıq (API işləməsə belə bu görünəcək)
    let title = "Ev Detalları | Güvən Turizm";
    let description = "Qubada ən yaxşı günlük evlər.";
    let imageUrl = "https://guventurizm.az/banner.png"; // Saytın statik şəkli (public papkasında olmalıdır)

    try {
        // 2. Data çəkməyə cəhd edirik (Timeout qoyuruq ki, ilişib qalmasın)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 saniyə vaxt

        const res = await fetch(`https://api.guventurizm.az/api/Houses/${id}`, {
            signal: controller.signal,
            next: { revalidate: 60 } // Hər 60 saniyədən bir yenilə
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const house = await res.json();
            title = `${house.title} | Güvən Turizm`;
            description = house.description?.substring(0, 150) + "..." || description;

            // Şəkil linkini yoxlayırıq
            if (house.coverImage) {
                imageUrl = house.coverImage.startsWith("http")
                    ? house.coverImage
                    : `https://api.guventurizm.az/api/files/${house.coverImage}`;
            }
        }
    } catch (error) {
        console.error("Metadata xətası:", error);
        // Xəta olsa belə yuxarıdakı default dəyərlər qalır
    }

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: "website",
        },
        // Twitter Kartı üçün
        twitter: {
            card: "summary_large_image",
            title: title,
            description: description,
            images: [imageUrl],
        },
    };
}

// --- PAGE COMPONENT ---
export default async function Page({ params }: Props) {
    const { id } = await params;
    return <HouseDetailClient id={id} />;
}