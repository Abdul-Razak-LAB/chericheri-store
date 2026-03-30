import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Banner = () => {
  return (
    <section className="section-wrap">
      <div className="relative flex flex-col md:flex-row items-center justify-between md:pl-16 py-12 md:py-0 soft-card overflow-hidden">
      <div className="absolute -left-8 top-8 h-40 w-40 rounded-full bg-[#d8b074]/25 blur-2xl" />
      <Image
        className="max-w-56 z-10"
        src={assets.mm4}
        alt="jbl_soundbox_image"
      />
      <div className="flex flex-col items-center justify-center text-center space-y-3 px-4 md:px-0 py-4 z-10">
        <p className="section-eyebrow">Exclusive this week</p>
        <h2 className="text-3xl md:text-4xl font-semibold max-w-[500px] text-balance">
          Level up your security with premium Turkish doors
        </h2>
        <p className="max-w-[420px] font-medium text-gray-700/80">
          Where protection meets prestige. Upgrade your entry with high-quality designs built to last.
        </p>

        <button className="group btn-primary">
          Buy now
          <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon_white} alt="arrow_icon_white" />
        </button>
      </div>

      <Image
        className="hidden md:block max-w-80 z-10"
        src={assets.mm4}
        alt="md_controller_image"
      />
      <Image
        className="md:hidden z-10"
        src={assets.mm4}
        alt="sm_controller_image"
      />

      </div>
    </section>
  );
};

export default Banner;