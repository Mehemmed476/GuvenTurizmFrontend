"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"; // <--- İKONLAR

export default function Footer() {
    const [settings, setSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        api.get("/Common/settings")
            .then(res => setSettings(res.data))
            .catch(err => console.error(err));
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brend */}
                    <div>
                        <Link href="/" className="text-2xl font-extrabold flex items-center gap-2 mb-6">
                            <span className="text-primary">Güvən</span> Turizm
                        </Link>
                        <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                            Qubada ən rahat və sərfəli günlük evləri tapmaq üçün güvənli ünvanınız. İstirahətinizi bizimlə planlaşdırın.
                        </p>

                        {/* SOSİAL MEDİA İKONLARI */}
                        <div className="flex gap-3">
                            {settings["Instagram"] && (
                                <a
                                    href={settings["Instagram"]}
                                    target="_blank"
                                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 hover:text-white transition-all duration-300 group"
                                    title="Instagram"
                                >
                                    <FaInstagram className="text-xl text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            )}
                            {settings["Facebook"] && (
                                <a
                                    href={settings["Facebook"]}
                                    target="_blank"
                                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-300 group"
                                    title="Facebook"
                                >
                                    <FaFacebookF className="text-lg text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            )}
                            {settings["Whatsapp"] && (
                                <a
                                    href={settings["Whatsapp"]}
                                    target="_blank"
                                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all duration-300 group"
                                    title="WhatsApp"
                                >
                                    <FaWhatsapp className="text-xl text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Linklər */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-l-4 border-primary pl-3">Sürətli Keçid</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link href="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Ana Səhifə</Link></li>
                            <li><Link href="/houses" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Evlər</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Haqqımızda</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Əlaqə</Link></li>
                        </ul>
                    </div>

                    {/* Əlaqə */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-l-4 border-primary pl-3">Bizimlə Əlaqə</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <span className="text-primary mt-1"><FaMapMarkerAlt /></span>
                                <span>{settings["Address"] || "Quba şəhəri, Azərbaycan"}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-primary"><FaPhoneAlt /></span>
                                <a href={`tel:${settings["PhoneNumber"]}`} className="hover:text-white transition-colors">
                                    {settings["PhoneNumber"] || "+994 50 000 00 00"}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-primary"><FaEnvelope /></span>
                                <a href={`mailto:${settings["Email"]}`} className="hover:text-white transition-colors">
                                    {settings["Email"] || "info@guventurizm.az"}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Məkan */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-l-4 border-primary pl-3">Məkanımız</h4>
                        <div className="h-40 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 opacity-80 hover:opacity-100 transition-opacity">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48107.07062299723!2d48.4727400403767!3d41.36443697926639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40f089930f353239%3A0x6a09075796c0d8b4!2sGuba!5e0!3m2!1sen!2saz!4v1700000000000!5m2!1sen!2saz"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
                    <p>{settings["Copyright"] || `© ${currentYear} Güvən Turizm. Bütün hüquqlar qorunur.`}</p>
                    <p className="flex items-center gap-1">
                        Made with <span className="text-red-500">♥</span> in Azerbaijan
                    </p>
                </div>
            </div>
        </footer>
    );
}