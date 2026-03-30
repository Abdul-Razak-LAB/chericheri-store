import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const products = [
  {
    id: 2,
    image: assets.KIO2,
    title: "Smart Electric Essentials",
    description: "Reliable devices and fittings designed to complement modern door systems.",
  },

  {
    id: 9,
    image: assets.KA,
    title: "Premium Security Collection",
    description: "Reinforced doors crafted for peace of mind and architectural elegance.",
  },
  {
    id: 10,
    image: assets.KK1,
    title: "Luxury Interior Finishes",
    description: "Discover statement-making pieces that elevate your entry and living spaces.",
  },
];

const FeaturedProduct = () => {
  return (
    <section className="section-wrap">
      <div className="flex flex-col items-start">
        <p className="section-eyebrow">Editor spotlight</p>
        <h2 className="section-title">Featured collections</h2>
        <p className="section-copy">Handpicked categories to help you find the right blend of security and style.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-10">
        {products.map(({ id, image, title, description }) => (
          <article key={id} className="relative group overflow-hidden rounded-3xl">
            <Image
              src={image}
              alt={title}
              className="group-hover:scale-105 transition duration-500 w-full h-[360px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#111820]/90 via-[#111820]/35 to-transparent" />
            <div className="group-hover:-translate-y-1 transition duration-300 absolute bottom-7 left-6 right-6 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl text-balance">{title}</p>
              <p className="text-sm lg:text-base leading-5 text-white/85">
                {description}
              </p>

              <button className="inline-flex items-center gap-1.5 mt-1 text-sm font-semibold text-[#f0c27f] hover:text-[#ffd39a] transition">
                Buy now <Image className="h-3 w-3" src={assets.redirect_icon} alt="Redirect Icon" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProduct;
