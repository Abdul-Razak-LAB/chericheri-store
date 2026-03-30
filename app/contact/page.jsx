"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const channels = [
    {
      title: "Call us",
      detail: "+233 209099310",
      href: "tel:+233209099310",
      note: "Mon - Sat, 8:00 AM to 6:00 PM",
    },
    {
      title: "Email us",
      detail: "chericheri82z@gmail.com",
      href: "mailto:chericheri82z@gmail.com",
      note: "We usually respond within 24 hours",
    },
    {
      title: "Visit us",
      detail: "Accra, Ghana",
      href: "https://maps.google.com/?q=Accra,Ghana",
      note: "Showroom visits by appointment",
    },
  ];

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Failed to send your inquiry.");
        return;
      }

      toast.success(result.message || "Your inquiry has been sent.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Unable to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-20 mx-auto h-64 w-[80%] rounded-full bg-[#e2bf86]/30 blur-3xl" />
      <Navbar />

      <section className="lux-shell section-wrap pb-14">
        <div className="soft-card p-6 md:p-10 lg:p-12">
          <p className="section-eyebrow">Contact us</p>
          <h1 className="section-title max-w-3xl text-balance">Talk to our team about your next security upgrade</h1>
          <p className="section-copy max-w-3xl">
            Whether you need a single premium door or full-property recommendations, we are ready to help you choose
            confidently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {channels.map((channel) => (
              <a
                key={channel.title}
                href={channel.href}
                target={channel.title === "Visit us" ? "_blank" : undefined}
                rel={channel.title === "Visit us" ? "noreferrer" : undefined}
                className="rounded-2xl border border-gray-200 bg-white/80 p-5 hover:border-[#ba7a27] transition"
              >
                <p className="text-sm uppercase tracking-[0.16em] text-[#a96d1d] font-semibold">{channel.title}</p>
                <p className="text-lg font-semibold text-gray-900 mt-2 break-words">{channel.detail}</p>
                <p className="text-sm text-gray-600 mt-1">{channel.note}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <article className="soft-card p-6 md:p-8">
            <p className="section-eyebrow">Send a message</p>
            <h2 className="text-2xl md:text-3xl mt-2">We are here to help</h2>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white/90 outline-none focus:border-[#b87928]"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white/90 outline-none focus:border-[#b87928]"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                <input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white/90 outline-none focus:border-[#b87928]"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you need"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/90 outline-none focus:border-[#b87928] resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full sm:w-auto px-8 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send inquiry"}
              </button>
            </form>
          </article>

          <article className="soft-card p-6 md:p-8 flex flex-col">
            <p className="section-eyebrow">Need fast answers?</p>
            <h2 className="text-2xl md:text-3xl mt-2">Start with these next steps</h2>

            <div className="space-y-4 mt-6">
              <div className="rounded-xl border border-gray-200 bg-white/85 p-4">
                <p className="font-semibold text-gray-900">Share your project type</p>
                <p className="text-sm text-gray-600 mt-1 leading-6">
                  Let us know if it is residential, office, or commercial so we can recommend suitable options quickly.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white/85 p-4">
                <p className="font-semibold text-gray-900">Tell us your preferred style</p>
                <p className="text-sm text-gray-600 mt-1 leading-6">
                  Modern, classic, or luxury finish. We can guide you to products that match your space.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white/85 p-4">
                <p className="font-semibold text-gray-900">Request a bundle quote</p>
                <p className="text-sm text-gray-600 mt-1 leading-6">
                  Need doors, handles, lockers, or kitchen fittings together? We can prepare a complete package.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">Prefer to browse first?</p>
              <Link href="/all-products" className="btn-secondary mt-3">
                Explore all products
              </Link>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ContactPage;
