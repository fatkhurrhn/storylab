import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone;
        setIsInstalled(standalone);

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", () => setIsInstalled(true));

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            alert("Browser kamu tidak mendukung install PWA otomatis.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("User install choice:", outcome);
        setDeferredPrompt(null);
    };

    return (
        <div className="bg-[#fcfeff] min-h-screen text-gray-800 font-sans">
            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
                {/* Left */}
                <div className="flex-1 text-center md:text-left space-y-5">
                    <img
                        src="https://res.cloudinary.com/dbssvz2pe/image/upload/v1757712535/assets-gallery/eajzq6265mm8w7a3w5mnth3nz.png"
                        alt="StoryLab Logo"
                        className="w-20 h-20 mx-auto md:mx-0"
                    />
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#355485] leading-tight">
                        StoryLab – Tools Kreatif untuk{" "}
                        <span className="text-[#4f90c6]">Kontenmu</span>
                    </h1>
                    <p className="text-gray-600 text-base md:text-lg">
                        Eksplorasi <strong>bahan mentahan</strong>, quotes, audio, video, dan
                        banyak lagi untuk upgrade konten story kamu. Semua dalam 1 aplikasi ringan.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center md:justify-start pt-2">
                        {!isInstalled ? (
                            <div className="flex flex-col items-center md:items-start">
                                <button
                                    onClick={handleInstall}
                                    className="bg-[#355485] hover:bg-[#2c3c63] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition inline-flex items-center justify-center"
                                >
                                    <i className="ri-download-cloud-fill mr-2"></i>
                                    Install StoryLab
                                </button>
                                <p className="text-xs text-gray-500 mt-2 max-w-xs text-center md:text-left">
                                    📲 Install akan menambahkan StoryLab ke layar utama HP kamu,
                                    jadi bisa dibuka seperti aplikasi biasa tanpa perlu browser.
                                </p>
                            </div>
                        ) : (
                            <span className="px-6 py-3 rounded-lg bg-green-100 text-green-700 font-medium shadow inline-flex items-center">
                                <i className="ri-checkbox-circle-fill mr-2"></i>
                                Sudah Terpasang 🎉
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Screenshot */}
                <div className="flex-1 flex justify-center relative">
                    <div className="relative">
                        <img
                            src="https://res.cloudinary.com/dbssvz2pe/image/upload/v1757714439/assets-gallery/edjthpp5okv19wrmr1ku3nio9.png"
                            alt="Screenshot 1"
                            className="w-56 md:w-64 rounded-xl shadow-lg border border-gray-200"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-12 md:py-16 border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-[#355485] mb-10">
                        ✨ Apa yang Kamu Dapatkan?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-5 bg-[#fcfeff] border border-[#90b6d5] rounded-xl shadow-sm hover:shadow-md transition">
                            <i className="ri-image-2-line text-4xl text-[#4f90c6]"></i>
                            <h3 className="mt-3 font-semibold text-[#355485]">Bahan Mentahan</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Ribuan foto, ilustrasi, dan resources visual untuk inspirasi kontenmu.
                            </p>
                        </div>
                        <div className="p-5 bg-[#fcfeff] border border-[#90b6d5] rounded-xl shadow-sm hover:shadow-md transition">
                            <i className="ri-video-line text-4xl text-[#4f90c6]"></i>
                            <h3 className="mt-3 font-semibold text-[#355485]">Video & Audio</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Koleksi video motivasi, musik, dan suara unik siap pakai untuk editing.
                            </p>
                        </div>
                        <div className="p-5 bg-[#fcfeff] border border-[#90b6d5] rounded-xl shadow-sm hover:shadow-md transition">
                            <i className="ri-quill-pen-line text-4xl text-[#4f90c6]"></i>
                            <h3 className="mt-3 font-semibold text-[#355485]">Quotes & Tools</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Kutipan inspiratif, tutorial, dan fitur tambahan untuk bikin story makin keren.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-14 text-center bg-gradient-to-r from-[#355485] to-[#4f90c6] text-white">
                <h2 className="text-2xl md:text-4xl font-bold mb-3">Yuk, Upgrade Story Kamu 🚀</h2>
                <p className="max-w-xl mx-auto mb-6 text-white/90">
                    StoryLab siap bantu kamu bikin konten lebih estetik, kreatif, dan profesional.
                </p>
                <button
                    onClick={handleInstall}
                    className="inline-block bg-white text-[#355485] px-8 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
                >
                    📲 Download Gratis Sekarang
                </button>
            </section>

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} StoryLab by storythur. All rights reserved.
            </footer>
        </div>
    );
}
