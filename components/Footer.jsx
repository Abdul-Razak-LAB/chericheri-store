import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mt-12 md:mt-16 bg-[#151d26] text-[#d9dee7]">
      <div className="lux-shell pt-10 md:pt-14 pb-7 md:pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-7 md:gap-9 lg:gap-10">
          <div className="col-span-2 lg:col-span-2">
            <Image className="w-28 md:w-32" src={assets.logo} alt="logo" />
            <p className="mt-4 md:mt-5 text-sm md:text-base text-[#b7c0cf] max-w-xl leading-6">
              Chericheri offers high-quality doors and related services including lockers, handles, home appliances, and kitchen cabinets.
              We provide durable and stylish solutions for residential and commercial properties while delivering excellent customer service.
            </p>

            <div className="flex items-center gap-3 md:gap-4 mt-5 md:mt-6">
              <a href="#" aria-label="Instagram" className="h-10 w-10 rounded-full border border-[#3a4657] flex items-center justify-center hover:border-[#cc8a2f] transition">
                <Image src={assets.instagram_icon} alt="instagram icon" className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="h-10 w-10 rounded-full border border-[#3a4657] flex items-center justify-center hover:border-[#cc8a2f] transition">
                <Image src={assets.facebook_icon} alt="facebook icon" className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="h-10 w-10 rounded-full border border-[#3a4657] flex items-center justify-center hover:border-[#cc8a2f] transition">
                <Image src={assets.twitter_icon} alt="twitter icon" className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-3 md:mb-4">Company</h2>
            <ul className="text-sm space-y-2 text-[#b7c0cf]">
              <li>
                <Link className="hover:text-white transition" href="/">Home</Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/all-products">Shop</Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/about">About us</Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/contact">Contact us</Link>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">Privacy policy</a>
              </li>
            </ul>
          </div>

          <div className="text-right">
            <h2 className="font-semibold text-white mb-3 md:mb-4">Get in touch</h2>
            <div className="text-sm space-y-2 text-[#b7c0cf]">
              <p>+233 209099310</p>
              <p>+233 209099310</p>
              <p>chericheri82z@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="divider-line mt-7 md:mt-10 mb-3 md:mb-4" />

        <p className="text-center text-xs md:text-sm text-[#9ba5b6]">
          Copyright 2026 © Chericheri Ghana Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;