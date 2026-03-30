"use client"
import React from "react";
import { assets } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {

  const { router, currencyCode, updateCurrencyCode, currencyOptions } = useAppContext();

  return (
    <nav className="sticky top-0 z-40 mt-4 mb-3 lux-shell">
      <div className="soft-card flex items-center justify-between px-4 md:px-8 py-3 border border-white/80 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />

      <div className="hidden md:flex items-center gap-5 lg:gap-8 text-sm lg:text-base font-medium">
        <Link href="/" className="hover:text-gray-900 transition-colors">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition-colors">
          Shop
        </Link>
        <Link href="/about" className="hover:text-gray-900 transition-colors">
          About
        </Link>
        <Link href="/contact" className="hover:text-gray-900 transition-colors">
          Contact
        </Link>

      </div>

      <ul className="hidden md:flex items-center gap-4">
        <select
          aria-label="Select currency"
          value={currencyCode}
          onChange={(e) => updateCurrencyCode(e.target.value)}
          className="bg-transparent border border-gray-300 rounded-full px-3 py-1 text-xs font-medium outline-none"
        >
          {Object.entries(currencyOptions).map(([code, symbol]) => (
            <option key={code} value={code}>{code} ({symbol})</option>
          ))}
        </select>

        <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
        <button
          onClick={() => router.push('/cart')}
          className="text-xs border border-gray-300 px-4 py-2 rounded-full hover:border-gray-500 transition"
        >
          Cart
        </button>
      </ul>

      <div className="md:hidden flex items-center gap-4 text-xs font-medium text-gray-600 border-t border-gray-200/80 mt-3 pt-3">
        <select
          aria-label="Select currency"
          value={currencyCode}
          onChange={(e) => updateCurrencyCode(e.target.value)}
          className="bg-transparent border border-gray-300 rounded-full px-2 py-1 text-[11px] font-medium outline-none"
        >
          {Object.entries(currencyOptions).map(([code, symbol]) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <Link href="/all-products" className="hover:text-gray-900 transition-colors">Shop</Link>
        <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
        <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
        <Link href="/cart" className="hover:text-gray-900 transition-colors">Cart</Link>
      </div>
      </div>
    </nav>
  );
};

export default Navbar;