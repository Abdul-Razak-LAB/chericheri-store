"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";

const Product = () => {

    const { id } = useParams();

    const { products, router, addToCart, buyNow, formatAmount } = useAppContext()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);

    useEffect(() => {
        const product = products.find((item) => item._id === id);
        setProductData(product || null);
        setMainImage(null);
    }, [id, products])

    return productData ? (<>
        <Navbar />
        <main className="lux-shell section-wrap pb-14 space-y-10">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <button onClick={() => router.push('/all-products')} className="hover:text-gray-700 transition">Shop</button>
                <span>/</span>
                <span className="text-gray-700 truncate">{productData.name}</span>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 soft-card p-5 md:p-8 lg:p-10">
                <div className="lg:px-4 xl:px-8">
                    <div className="rounded-2xl overflow-hidden bg-white mb-4 border border-gray-200/70">
                        <Image
                            src={mainImage || productData.image[0]}
                            alt="alt"
                            className="w-full h-auto object-cover"
                            width={1280}
                            height={720}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {productData.image.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(image)}
                                className={`cursor-pointer rounded-xl overflow-hidden border transition ${
                                    (mainImage || productData.image[0]) === image
                                        ? 'border-[#b87928] shadow-[0_6px_16px_rgba(184,121,40,0.25)]'
                                        : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <Image
                                    src={image}
                                    alt="alt"
                                    className="w-full h-auto object-cover"
                                    width={1280}
                                    height={720}
                                />
                            </div>

                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <p className="section-eyebrow">Product details</p>
                    <h1 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 mt-1 text-balance">
                        {productData.name}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image
                                className="h-4 w-4"
                                src={assets.star_dull_icon}
                                alt="star_dull_icon"
                            />
                        </div>
                        <p className="text-sm text-gray-600">(4.5)</p>
                    </div>
                    <p className="text-gray-600 mt-4 leading-7">
                        {productData.description}
                    </p>
                    <p className="text-3xl font-semibold mt-6 text-gray-900">
                        {formatAmount(productData.offerPrice)}
                        <span className="text-base font-normal text-gray-500 line-through ml-2">
                            {formatAmount(productData.price)}
                        </span>
                    </p>

                    <div className="my-6 divider-line" />

                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-80">
                            <tbody>
                                <tr>
                                    <td className="text-gray-700 font-medium py-1">Brand</td>
                                    <td className="text-gray-500 py-1">Chericheri</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-700 font-medium py-1">Color</td>
                                    <td className="text-gray-500 py-1">Multi</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-700 font-medium py-1">Category</td>
                                    <td className="text-gray-500 py-1">
                                        {productData.category}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center mt-10 gap-4">
                        <button
                            onClick={() => addToCart(productData._id)}
                            className="w-full py-3.5 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                        >
                            Add to Cart
                        </button>

                        <button
                            onClick={() => buyNow(productData._id)}
                            className="w-full py-3.5 rounded-full btn-primary"
                        >
                            Buy now
                        </button>
                    </div>
                </div>
            </section>

            <section className="flex flex-col items-center pt-6">
                <div className="w-full flex flex-col items-start mb-2 mt-6">
                    <p className="section-eyebrow">You may also like</p>
                    <h2 className="section-title">Featured products</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                    {products.slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
                </div>

                <button
                    onClick={() => router.push('/all-products')}
                    className="btn-secondary px-8"
                >
                    View more
                </button>
            </section>
        </main>
        <Footer />
    </>
    ) : <Loading />
};

export default Product;