import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

// Sayt hissəsi üçün xüsusi başlıq (Title)
export const metadata: Metadata = {
  title: "Güvən Turizm - Qubada Günlük Evlər",
  description: "Qubada ən sərfəli günlük kirayə evlər və villalar.",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}