import React from "react";

const NewsLetter = () => {
  return (
    <section className="section-wrap pb-14">
      <div className="soft-card px-6 md:px-10 py-10 md:py-12 flex flex-col items-center justify-center text-center">
        <p className="section-eyebrow">Stay updated</p>
        <h2 className="md:text-4xl text-3xl font-medium mt-2 text-balance">
          Subscribe and get early access to special drops
        </h2>
        <p className="md:text-base text-gray-600 max-w-2xl pt-4 pb-8">
          Be first to know when new Turkish door collections, hardware bundles, and installation offers go live.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl w-full">
          <input
            className="border border-gray-300 rounded-full h-12 outline-none w-full px-5 text-gray-700 bg-white/85"
            type="text"
            placeholder="Enter your email address"
          />
          <button className="btn-primary h-12 px-8 w-full sm:w-auto">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsLetter;
