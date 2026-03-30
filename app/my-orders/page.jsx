'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

const MyOrders = () => {
    const PROCESSING_AFTER_MS = 60 * 1000;
    const DELIVERED_AFTER_MS = 3 * 60 * 1000;

    const { orders, cancelOrder, formatAmount } = useAppContext();

    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(Date.now());

    const fetchOrders = async () => {
        setLoading(false);
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusStyles = (status) => {
        if (status === "Delivered") return "bg-green-100 text-green-700 border-green-200";
        if (status === "Processing") return "bg-blue-100 text-blue-700 border-blue-200";
        if (status === "Cancelled") return "bg-red-100 text-red-700 border-red-200";
        return "bg-amber-100 text-amber-700 border-amber-200";
    };

    const handleCancelOrder = (orderId) => {
        const result = cancelOrder(orderId);
        if (!result.success) {
            toast.error(result.message);
            return;
        }

        toast.success(result.message);
    };

    const formatDuration = (ms) => {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
    };

    const getETA = (order) => {
        if (order.status === "Cancelled") return "Order cancelled";
        if (order.status === "Delivered") return "Delivered";

        const elapsed = Math.max(0, currentTime - Number(order.date || currentTime));

        if (elapsed < PROCESSING_AFTER_MS) {
            return `Processing starts in ${formatDuration(PROCESSING_AFTER_MS - elapsed)}`;
        }

        if (elapsed < DELIVERED_AFTER_MS) {
            return `Estimated delivery in ${formatDuration(DELIVERED_AFTER_MS - elapsed)}`;
        }

        return "Delivered";
    };

    const isStepComplete = (order, step) => {
        const status = order.status;
        if (status === "Cancelled") {
            return step === "Placed";
        }

        if (step === "Placed") return true;
        if (step === "Processing") return status === "Processing" || status === "Delivered";
        if (step === "Delivered") return status === "Delivered";
        return false;
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <h2 className="text-lg font-medium mt-6">My Orders</h2>
                    {loading ? (
                        <Loading />
                    ) : !orders.length ? (
                        <div className="max-w-5xl border border-gray-300 rounded-xl p-8 text-center text-gray-600">
                            You have no orders yet.
                        </div>
                    ) : (
                        <div className="max-w-5xl border-t border-gray-300 text-sm">
                            {orders.map((order, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300">
                                    <div className="flex-1 flex gap-5 max-w-80">
                                        <Image
                                            className="max-w-16 max-h-16 object-cover"
                                            src={assets.box_icon}
                                            alt="box_icon"
                                        />
                                        <p className="flex flex-col gap-3">
                                            <span className="font-medium text-base">
                                                {order.items.map((item) => item.product.name + ` x ${item.quantity}`).join(", ")}
                                            </span>
                                            <span>Items : {order.items.length}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p>
                                            <span className="font-medium">{order.address.fullName}</span>
                                            <br />
                                            <span>{order.address.area}</span>
                                            <br />
                                            <span>{`${order.address.city}, ${order.address.state}`}</span>
                                            <br />
                                            <span>{order.address.phoneNumber}</span>
                                        </p>
                                    </div>
                                    <p className="font-medium my-auto">{formatAmount(order.amount)}</p>
                                    <div>
                                        <p className="flex flex-col">
                                            <span>Method : COD</span>
                                            <span>Date : {new Date(order.date).toLocaleDateString()}</span>
                                            <span>Payment : Pending</span>
                                        </p>

                                        <p className="text-xs text-gray-500 mt-1">{getETA(order)}</p>

                                        <span className={`inline-flex items-center justify-center text-xs px-3 py-1 rounded-full border mt-2 ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>

                                        <div className="mt-3">
                                            <div className="flex items-center gap-2">
                                                {["Placed", "Processing", "Delivered"].map((step, stepIndex) => {
                                                    const completed = isStepComplete(order, step);
                                                    return (
                                                        <React.Fragment key={step}>
                                                            <div className={`h-2.5 w-2.5 rounded-full ${completed ? "bg-green-500" : "bg-gray-300"}`}></div>
                                                            {stepIndex < 2 && (
                                                                <div className={`h-[2px] w-8 ${isStepComplete(order, step === "Placed" ? "Processing" : "Delivered") ? "bg-green-400" : "bg-gray-300"}`}></div>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                                                <span>Placed</span>
                                                <span>Processing</span>
                                                <span>Delivered</span>
                                            </div>
                                        </div>

                                        {(order.status === "Placed" || order.status === "Processing") && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="block text-xs mt-2 text-red-600 hover:text-red-700 transition"
                                            >
                                                Cancel order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;