import React from "react";
import BottomNav from "../components/BottomNav";
import Header from "../components/home/Header";
import Quote from "../components/home/Quote";
import QuickMenu from "../components/home/QuickMenu";
import KategoriSlider from "../components/home/KategoriSlider";
import VidMotivasi from "../components/home/VidMotivasi";
import Kontribusi from "../components/home/Kontribusi";
import PremiumTools from "../components/home/PremiumTools";
import Populer from "../components/home/Populer";

export default function HomePage() {

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-[#fcfeff] pb-20">
      <Header />
      <Quote />
      <QuickMenu />
      <KategoriSlider />
      <VidMotivasi />
      {/* <Kontribusi /> */}
      <PremiumTools />
      <Populer />

      <div className="text-center text-xs text-gray-400 mt-10">
        © {new Date().getFullYear()} StoryLab by Storythur
      </div>
      <BottomNav />
    </div>
  );
}
