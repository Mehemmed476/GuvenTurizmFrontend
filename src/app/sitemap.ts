import { MetadataRoute } from 'next';

// Evlərin tipi
interface House {
    id: string;
    updatedAt?: string; // Əgər backend-də varsa
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://guventurizm.az";

    let houses: House[] = [];

    try {
        // Backend-dən bütün aktiv evləri çəkirik
        const res = await fetch(`${API_URL}/Houses/active`, { next: { revalidate: 3600 } });
        if (res.ok) {
            houses = await res.json();
        }
    } catch (error) {
        console.error("Sitemap error:", error);
    }

    // Statik səhifələr
    const routes = [
        "",
        "/houses",
        "/about",
        "/contact",
    ].map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    // Dinamik Ev Səhifələri
    const houseRoutes = houses.map((house) => ({
        url: `${SITE_URL}/houses/${house.id}`,
        lastModified: new Date(), // və ya house.updatedAt
        changeFrequency: "weekly" as const,
        priority: 0.9, // Evlər vacibdir
    }));

    return [...routes, ...houseRoutes];
}