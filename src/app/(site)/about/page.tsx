"use client";

import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="bg-white dark:bg-black min-h-screen pb-20 transition-colors duration-300">

            {/* --- BAŞLIQ HİSSƏSİ (Hero) --- */}
            <section className="relative py-20 bg-gray-50 dark:bg-black overflow-hidden transition-colors duration-300">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">

                        {/* Sol: Mətn */}
                        <div className="lg:w-1/2">
                            <h4 className="text-primary font-bold uppercase tracking-wider mb-2">Biz Kimik?</h4>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                Qubada Sizin <br />
                                <span className="text-primary">İkinci Eviniz</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                "Güvən Turizm" olaraq 2019-cu ildən bəri Azərbaycanın dilbər guşəsi Qubada qonaqlarımıza yüksək səviyyəli xidmət göstəririk. Məqsədimiz sadəcə ev kirayələmək deyil, sizə unudulmaz xatirələr bəxş etməkdir.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Meşə kənarında sakitlik axtaranlardan, şəhər mərkəzində lüks sevənlərə qədər hər zövqə uyğun evlərimiz var. Təmizlik, təhlükəsizlik və müştəri məmnuniyyəti bizim qırmızı xəttimizdir.
                            </p>

                            <div className="flex gap-4">
                                <Link href="/houses" className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg">
                                    Evlərimizə Baxın
                                </Link>
                            </div>
                        </div>

                        {/* Sağ: Şəkil Kollajı */}
                        <div className="lg:w-1/2 relative">
                            <div className="grid grid-cols-2 gap-4">
                                <img
                                    src="https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="Quba Evi 1"
                                    className="rounded-2xl shadow-lg w-full h-64 object-cover transform translate-y-8"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1587061949409-02df41d5e562?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="Quba Evi 2"
                                    className="rounded-2xl shadow-lg w-full h-64 object-cover"
                                />
                            </div>
                            {/* Dekorativ dairə */}
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-100/50 rounded-full blur-3xl"></div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- STATİSTİKA --- */}
            <section className="py-16 bg-gray-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">5+</div>
                            <div className="text-gray-400 font-medium">İllik Təcrübə</div>
                        </div>

                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">50+</div>
                            <div className="text-gray-400 font-medium">Lüks Evlər</div>
                        </div>

                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">1k+</div>
                            <div className="text-gray-400 font-medium">Məmnun Qonaq</div>
                        </div>

                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">24/7</div>
                            <div className="text-gray-400 font-medium">Canlı Dəstək</div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- NİYƏ BİZ? (Dəyərlərimiz) --- */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Niyə Məhz <span className="text-primary">Güvən Turizm?</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Biz sadəcə açarları təhvil vermirik, biz sizin rahatlığınızın təminatçısıyıq.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Kart 1 */}
                        <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 hover:border-primary/30 transition-colors group text-center">
                            <div className="w-16 h-16 mx-auto bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tam Təmizlik</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Hər qonaqdan sonra evlərimiz peşəkar komanda tərəfindən xüsusi dezinfeksiya edici vasitələrlə təmizlənir.
                            </p>
                        </div>

                        {/* Kart 2 */}
                        <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 hover:border-primary/30 transition-colors group text-center">
                            <div className="w-16 h-16 mx-auto bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">100% Güvənli</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Bizimlə işləmək rəsmi və təhlükəsizdir. Ödənişləriniz qorunur, evlər şəkildə gördüyünüz kimidir. Sürpriz yoxdur.
                            </p>
                        </div>

                        {/* Kart 3 */}
                        <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 hover:border-primary/30 transition-colors group text-center">
                            <div className="w-16 h-16 mx-auto bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Dəstək Xidməti</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Gecə və ya gündüz fərq etməz. Qonaq olduğunuz müddətdə hər hansı ehtiyacınız olarsa, bir zəng qədər uzağıq.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- SON ÇAĞIRIŞ (CTA) --- */}
            <section className="container mx-auto px-4">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center relative overflow-hidden">
                    {/* Arxa plan dekor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20"></div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
                        Qubada istirahət etməyə hazırsınız?
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-xl mx-auto relative z-10">
                        Elə indi evlərimizə göz atın və sizə ən uyğun olanı rezervasiya edin.
                    </p>
                    <Link href="/houses" className="inline-block btn-primary px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-orange-500/20 relative z-10">
                        Evləri Kəşf Et
                    </Link>
                </div>
            </section>

        </main>
    );
}