// src/app/(site)/terms/page.tsx

import React from "react";

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">
                GÜVƏN TURİZM – KİRAYƏ EVLƏR ÜZRƏ ŞƏRTLƏR
            </h1>

            <div className="space-y-8 text-gray-700 leading-relaxed">

                {/* 1. Ümumi müddəalar */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">1. Ümumi müddəalar</h2>
                    <p>
                        Güvən Turizm tərəfindən təklif olunan kirayə evlər gündəlik və ya müddətli əsasda təqdim olunur.
                        Müştəri evi bron etməklə bu şərtlərlə razılaşmış hesab olunur.
                    </p>
                </section>

                {/* 2. Rezervasiya və ödəniş */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">2. Rezervasiya və ödəniş</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Ev yalnız öncədən bron edildikdən sonra təqdim olunur.</li>
                        <li>Rezervasiya üçün razılaşdırılmış beh (avans) ödənilməlidir.</li>
                        <li>Qalan məbləğ evə giriş günü tam ödənilir.</li>
                    </ul>
                </section>

                {/* 3. Giriş və çıxış vaxtı */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">3. Giriş və çıxış vaxtı</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Giriş (Check-in):</strong> 14:00-dan sonra</li>
                        <li><strong>Çıxış (Check-out):</strong> 12:00-a qədər</li>
                        <li>Gec giriş və gec çıxış yalnız əvvəlcədən razılaşdırılmaqla mümkündür.</li>
                    </ul>
                </section>

                {/* 4. Ləğv və dəyişiklik şərtləri */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">4. Ləğv və dəyişiklik şərtləri</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Girişə 48 saatdan az qaldıqda ləğv edilərsə, beh geri qaytarılmır.</li>
                        <li>Tarix dəyişiklikləri mövcudluqdan asılıdır.</li>
                    </ul>
                </section>

                {/* 5. Evə dəyən ziyan */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">5. Evə dəyən ziyan</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Ev əşyalarına və inventara vurulan ziyana görə məsuliyyət müştəriyə aiddir.</li>
                        <li>Zərər aşkar edilərsə, məbləğ müştəridən tutulur.</li>
                    </ul>
                </section>

                {/* 6. Qaydalara riayət */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">6. Qaydalara riayət</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Evdə səs-küy, məclis və qaydalara zidd davranış qadağandır.</li>
                        <li>Evdə siqaret çəkmək (icazə olmayan evlərdə) qadağandır.</li>
                        <li>Evdə icazə veriləndən artıq adam qalması qadağandır.</li>
                    </ul>
                </section>

                {/* 7. Təmizlik */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">7. Təmizlik</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Ev təmiz və istifadəyə hazır vəziyyətdə təhvil verilir.</li>
                        <li>Müştəri evi normal vəziyyətdə təhvil verməlidir.</li>
                    </ul>
                </section>

                {/* 8. Heyvanlar */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">8. Heyvanlar</h2>
                    <p>
                        Ev heyvanları yalnız əvvəlcədən razılaşdırıldıqda icazəlidir.
                    </p>
                </section>

                {/* 9. Məsuliyyətin məhdudlaşdırılması */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">9. Məsuliyyətin məhdudlaşdırılması</h2>
                    <p>
                        Elektrik, su, internet və digər texniki problemlərdən yaranan fasilələrə görə Güvən Turizm məsuliyyət daşımır.
                    </p>
                </section>

                {/* 10. Fors-major hallar */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">10. Fors-major hallar</h2>
                    <p>
                        Təbii fəlakət, hava şəraiti, dövlət məhdudiyyətləri və digər fors-major hallarda tərəflər bir-birinə iddia irəli sürə bilməz.
                    </p>
                </section>

            </div>
        </div>
    );
}