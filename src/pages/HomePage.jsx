import React, { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import Header from "../components/home/Header";
import Quote from "../components/home/Quote";
import QuickMenu from "../components/home/QuickMenu";
import KategoriSlider from "../components/home/KategoriSlider";
import VidMotivasi from "../components/home/VidMotivasi";
import PremiumTools from "../components/home/PremiumTools";
import Populer from "../components/home/Populer";
import LandingPage from "./LandingPage";

export default function HomePage() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // cek mode standalone (PWA)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;
    setIsStandalone(standalone);
  }, []);

  // 👉 kalau bukan standalone → tampilkan LandingPage
  if (!isStandalone) {
    return <LandingPage />;
  }

  // 👉 kalau standalone (PWA) → tampilkan app utama
  return (
    <div className="min-h-screen bg-white text-[#44515f] pb-10">
      <Header />
      <Quote />
      <QuickMenu />
      <KategoriSlider />
      <VidMotivasi />
      <PremiumTools />
      <Populer />

      <div className="text-center text-xs text-gray-400 mt-10">
        © {new Date().getFullYear()} StoryLab by Storythur
      </div>
      <BottomNav />
    </div>
  );
}
