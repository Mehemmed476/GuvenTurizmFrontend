import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// --- GÜCLÜ SEO METADATA ---
export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://guventurizm.az"),
    title: {
        default: "Qubada Günlük Kirayə Evlər və Villalar | Güvən Turizm",
        template: "%s | Güvən Turizm - Quba",
    },
    description: "Qubada, Qəçrəşdə və Təngəaltıda ən sərfəli günlük kirayə evlər, villalar və koteclər. Meşə kənarında, hovuzlu və ya dağ mənzərəli evləri indi bron edin.",
    keywords: [
        "Quba", "Quba kiraye evler", "Qecreş", "Tengealti", "Xinaliq",
        "günlük evlər", "villa kirayəsi", "Qubada istirahət", "koteclər", "Güvən Turizm"
    ],
    authors: [{ name: "Güvən Turizm" }],
    creator: "Güvən Turizm",
    publisher: "Güvən Turizm",
    openGraph: {
        type: "website",
        locale: "az_AZ",
        url: "https://guventurizm.az",
        siteName: "Güvən Turizm",
        title: "Qubada Xəyalınızdakı İstirahət | Kirayə Evlər",
        description: "Qubanın ən gözəl guşələrində günlük kirayə evlər və villalar. İndi bron edin, rahat dincəlin.",
        images: [
            {
                url: "/banner.png",
                width: 1200,
                height: 630,
                alt: "Quba Kirayə Evlər",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "name": "Güvən Turizm",
        "image": "https://guventurizm.az/banner.png",
        "description": "Qubada günlük kirayə evlər və villaların ən böyük bazası.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "H. Əliyev prospekti",
            "addressLocality": "Quba",
            "addressRegion": "Quba-Xaçmaz",
            "postalCode": "AZ4000",
            "addressCountry": "AZ"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 41.3643,
            "longitude": 48.5146
        },
        "url": "https://guventurizm.az",
        "telephone": "+994501234567",
        "priceRange": "50-500 AZN",
        "areaServed": "Quba"
    };

    return (
        <html lang="az">
            <body className={inter.className}>
                <Script
                    id="schema-org"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-center"
                        reverseOrder={false}
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#FFFFFF',
                                color: '#1F2937',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '16px',
                            },
                            success: {
                                iconTheme: { primary: '#FF8C00', secondary: 'white' },
                                style: { borderLeft: '4px solid #FF8C00' }
                            },
                            error: {
                                iconTheme: { primary: '#EF4444', secondary: 'white' },
                                style: { borderLeft: '4px solid #EF4444' }
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}