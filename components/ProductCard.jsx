import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {

    const { formatAmount, router } = useAppContext()

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-1 max-w-[220px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-white/80 rounded-2xl border border-white/80 shadow-[0_10px_25px_rgba(17,24,32,0.08)] w-full h-56 flex items-center justify-center overflow-hidden">
                <Image src={product.image[0]} alt={product.name}
                    className="group-hover:scale-105 transition duration-500 object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                />

                <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition">
                    <Image
                        className="h-3 w-3"
                        src={assets.heart_icon}
                        alt="heart_icon"
                    />
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate text-gray-900">{product.name}</p>
            <p className="w-full text-xs text-gray-600 max-sm:hidden truncate">{product.description}</p>

            <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image key={index} className="h-3 w-3"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1.5">
                <p className="text-base font-semibold text-gray-900">{formatAmount(product.offerPrice)}</p>
                <button className="max-sm:hidden px-4 py-1.5 text-gray-700 border border-gray-300 rounded-full text-xs hover:border-gray-500 transition">
                    Buy now
                </button>
            </div>
        </div>
    )
}

export default ProductCard