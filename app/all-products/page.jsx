'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const AllProducts = () => {

    const { products } = useAppContext();

    return (
        <main className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 -top-20 mx-auto h-64 w-[80%] rounded-full bg-[#e2bf86]/30 blur-3xl" />
            <Navbar />
            <section className="lux-shell section-wrap pb-14">
                <div className="flex flex-col items-start">
                    <p className="section-eyebrow">Complete collection</p>
                    <h1 className="section-title">All products</h1>
                    <p className="section-copy">
                        Browse our full catalog of premium security doors, fittings, and interior essentials.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-10 w-full">
                    {products.map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
            </section>
            <Footer />
        </main>
    );
};

export default AllProducts;
