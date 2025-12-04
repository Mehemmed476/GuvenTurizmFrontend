import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Güvən Turizm",
    description: "Qubada günlük kirayə evlər",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="az">
            <body className={inter.className}>
                {children}

                {/* YENİLƏNMİŞ TOASTER AYARLARI */}
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{
                        duration: 4000,
                        // Ümumi Stil (Ağ Qutu, Qara Yazı, Kölgə)
                        style: {
                            background: '#FFFFFF',
                            color: '#1F2937', // Tünd Boz (Gray-800)
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Şıq kölgə
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            padding: '16px',
                        },
                        // Uğurlu (Success) üçün xüsusi ayar
                        success: {
                            iconTheme: {
                                primary: '#FF8C00', // Narıncı İkon
                                secondary: 'white',
                            },
                            style: {
                                borderLeft: '4px solid #FF8C00', // Sol tərəfdə narıncı zolaq
                            }
                        },
                        // Xəta (Error) üçün xüsusi ayar
                        error: {
                            iconTheme: {
                                primary: '#EF4444', // Qırmızı İkon
                                secondary: 'white',
                            },
                            style: {
                                borderLeft: '4px solid #EF4444', // Sol tərəfdə qırmızı zolaq
                            }
                        },
                    }}
                />
            </body>
        </html>
    );
}