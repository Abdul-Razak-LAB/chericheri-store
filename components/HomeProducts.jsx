import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {

  const { products, router } = useAppContext()

  return (
    <section className="section-wrap flex flex-col items-center">
      <div className="w-full flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="section-eyebrow">Most requested picks</p>
          <h2 className="section-title">Popular products</h2>
          <p className="section-copy mt-2">
            Explore our best-selling doors and fittings trusted by homes and commercial spaces.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-8 pb-12 w-full">
        {products.map((product, index) => <ProductCard key={index} product={product} />)}
      </div>

      <button
        onClick={() => { router.push('/all-products') }}
        className="btn-secondary min-w-[170px]"
      >
        View all products
      </button>
    </section>
  );
};

export default HomeProducts;
