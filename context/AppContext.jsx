'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

const ORDER_STATUS = {
    PLACED: "Placed",
    PROCESSING: "Processing",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

const PROCESSING_AFTER_MS = 60 * 1000;
const DELIVERED_AFTER_MS = 3 * 60 * 1000;

const CURRENCY_OPTIONS = {
    GHS: "GH₵",
    USD: "$",
};

const GARAGE_DOOR_MODEL_NUMBERS = new Set([10, 11, 12, 23, 24, 25, 26, 27]);

const normalizeCurrencyCode = (value) => {
    const upperValue = String(value || "").toUpperCase();

    if (upperValue === "GH₵" || upperValue === "GHC") return "GHS";
    if (upperValue === "$" || upperValue === "US$") return "USD";

    if (CURRENCY_OPTIONS[upperValue]) return upperValue;

    return "GHS";
};

export const AppContextProvider = (props) => {

    const defaultCurrencyCode = normalizeCurrencyCode(process.env.NEXT_PUBLIC_CURRENCY || "GHS");
    const usdToGhsRate = Number(process.env.NEXT_PUBLIC_USD_TO_GHS || 15);
    const router = useRouter()
    const taxRate = 0.02

    // const { user } = useUser()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(true)
    const [cartItems, setCartItems] = useState({})
    const [userAddresses, setUserAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [orders, setOrders] = useState([])
    const [buyNowItem, setBuyNowItem] = useState(null)
    const [currencyCode, setCurrencyCode] = useState(defaultCurrencyCode)

    const currency = CURRENCY_OPTIONS[currencyCode] || CURRENCY_OPTIONS.GHS;

    const getStorageData = (key, fallbackValue) => {
        try {
            if (typeof window === "undefined") return fallbackValue;
            const rawValue = localStorage.getItem(key);
            return rawValue ? JSON.parse(rawValue) : fallbackValue;
        } catch {
            return fallbackValue;
        }
    }

    const setStorageData = (key, value) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(key, JSON.stringify(value));
    }

    const updateCurrencyCode = (code) => {
        const normalizedCode = normalizeCurrencyCode(code);
        setCurrencyCode(normalizedCode);
        setStorageData("currencyCode", normalizedCode);
    }

    const resolvePrice = (product) => {
        const price = Number(product?.offerPrice ?? product?.price ?? 0);
        return Number.isFinite(price) ? price : 0;
    }

    const getExchangeRate = useCallback((targetCode = currencyCode) => {
        if (targetCode === "GHS") return usdToGhsRate;
        return 1;
    }, [currencyCode, usdToGhsRate])

    const convertAmount = useCallback((amount, targetCode = currencyCode) => {
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount)) return 0;

        const rate = getExchangeRate(targetCode);
        const convertedAmount = numericAmount * rate;
        return Math.round(convertedAmount * 100) / 100;
    }, [currencyCode, getExchangeRate])

    const formatAmount = useCallback((amount, targetCode = currencyCode) => {
        const symbol = CURRENCY_OPTIONS[targetCode] || CURRENCY_OPTIONS.GHS;
        return `${symbol}${convertAmount(amount, targetCode).toFixed(2)}`;
    }, [convertAmount, currencyCode])

    const normalizeStatus = useCallback((status) => {
        if (!status || status === "Order Placed") return ORDER_STATUS.PLACED;
        if (status === ORDER_STATUS.PLACED) return ORDER_STATUS.PLACED;
        if (status === ORDER_STATUS.PROCESSING) return ORDER_STATUS.PROCESSING;
        if (status === ORDER_STATUS.DELIVERED) return ORDER_STATUS.DELIVERED;
        if (status === ORDER_STATUS.CANCELLED) return ORDER_STATUS.CANCELLED;
        return ORDER_STATUS.PLACED;
    }, [])

    const getProgressedStatus = useCallback((order, now = Date.now()) => {
        const currentStatus = normalizeStatus(order?.status);

        if (currentStatus === ORDER_STATUS.CANCELLED || currentStatus === ORDER_STATUS.DELIVERED) {
            return currentStatus;
        }

        const elapsed = Math.max(0, now - Number(order?.date || now));

        if (elapsed >= DELIVERED_AFTER_MS) return ORDER_STATUS.DELIVERED;
        if (elapsed >= PROCESSING_AFTER_MS) return ORDER_STATUS.PROCESSING;
        return ORDER_STATUS.PLACED;
    }, [normalizeStatus])

    const syncOrderStatuses = useCallback(() => {
        setOrders((previousOrders) => {
            if (!previousOrders.length) return previousOrders;

            let changed = false;
            const now = Date.now();

            const updatedOrders = previousOrders.map((order) => {
                const nextStatus = getProgressedStatus(order, now);
                const normalizedCurrent = normalizeStatus(order.status);

                if (nextStatus === normalizedCurrent) {
                    return { ...order, status: normalizedCurrent };
                }

                changed = true;
                return {
                    ...order,
                    status: nextStatus,
                    updatedAt: now,
                };
            });

            if (changed) {
                setStorageData("orders", updatedOrders);
            }

            return updatedOrders;
        });
    }, [getProgressedStatus, normalizeStatus])

    const normalizeCatalogProducts = useCallback((items = []) => {
        return items.map((product, index) => {
            const modelNumber = index + 1;

            if (GARAGE_DOOR_MODEL_NUMBERS.has(modelNumber)) {
                return {
                    ...product,
                    name: "Garage Door",
                    category: "Garage Door",
                };
            }

            return {
                ...product,
                name: `Door Model ${modelNumber}`,
                category: "Door",
            };
        });
    }, [])

    const fetchProductData = useCallback(async () => {
        setProducts(normalizeCatalogProducts(productsDummyData))
    }, [normalizeCatalogProducts])

    const fetchUserData = async () => {
        setUserData(userDummyData)
    }

    const addToCart = async (itemId, quantity = 1) => {
        if (quantity < 1) return;

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += quantity;
        }
        else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        setStorageData("cartItems", cartData);

    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        const validQuantity = Number(quantity);

        if (!Number.isFinite(validQuantity) || validQuantity <= 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = Math.floor(validQuantity);
        }
        setCartItems(cartData)
        setStorageData("cartItems", cartData);

    }

    const buyNow = (itemId) => {
        setBuyNowItem({ itemId, quantity: 1 });
        router.push('/cart');
    }

    const clearBuyNow = () => {
        setBuyNowItem(null);
    }

    const getCheckoutItems = () => {
        if (buyNowItem && buyNowItem.itemId && buyNowItem.quantity > 0) {
            return [{ itemId: buyNowItem.itemId, quantity: buyNowItem.quantity }];
        }

        return Object.entries(cartItems)
            .filter(([, quantity]) => Number(quantity) > 0)
            .map(([itemId, quantity]) => ({ itemId, quantity: Number(quantity) }));
    }

    const getCheckoutAmount = () => {
        return getCheckoutItems().reduce((amount, item) => {
            const product = products.find((productData) => productData._id === item.itemId);
            if (!product) return amount;
            return amount + resolvePrice(product) * item.quantity;
        }, 0);
    }

    const getCheckoutCount = () => {
        return getCheckoutItems().reduce((count, item) => count + item.quantity, 0);
    }

    const addAddress = (addressData) => {
        const newAddress = {
            ...addressData,
            _id: Date.now().toString(),
        };

        const updatedAddresses = [newAddress, ...userAddresses];
        setUserAddresses(updatedAddresses);
        setSelectedAddress(newAddress);
        setStorageData("userAddresses", updatedAddresses);
        setStorageData("selectedAddress", newAddress);
    }

    const selectAddress = (addressData) => {
        setSelectedAddress(addressData);
        setStorageData("selectedAddress", addressData);
    }

    const placeOrder = () => {
        const checkoutItems = getCheckoutItems();

        if (!checkoutItems.length) {
            return { success: false, message: "Your cart is empty." };
        }

        if (!selectedAddress) {
            return { success: false, message: "Please select a shipping address." };
        }

        const orderItems = checkoutItems
            .map((item) => {
                const product = products.find((productData) => productData._id === item.itemId);
                if (!product) return null;

                return {
                    product,
                    quantity: item.quantity,
                };
            })
            .filter(Boolean);

        const subTotal = getCheckoutAmount();
        const taxAmount = Math.floor(subTotal * taxRate * 100) / 100;
        const totalAmount = Math.floor((subTotal + taxAmount) * 100) / 100;

        const newOrder = {
            _id: Date.now().toString(),
            userId: userData?._id || "guest-user",
            items: orderItems,
            amount: totalAmount,
            address: selectedAddress,
            status: ORDER_STATUS.PLACED,
            date: Date.now(),
        };

        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        setStorageData("orders", updatedOrders);

        if (buyNowItem) {
            setBuyNowItem(null);
        } else {
            const updatedCart = { ...cartItems };
            checkoutItems.forEach((item) => {
                delete updatedCart[item.itemId];
            });
            setCartItems(updatedCart);
            setStorageData("cartItems", updatedCart);
        }

        return { success: true, order: newOrder };
    }

    const clearCart = () => {
        setCartItems({});
        setStorageData("cartItems", {});
        setBuyNowItem(null);
    }

    const getOrderList = () => {
        return orders;

    }

    const cancelOrder = (orderId) => {
        let cancelled = false;

        setOrders((previousOrders) => {
            const updatedOrders = previousOrders.map((order) => {
                if (order._id !== orderId) return order;

                const currentStatus = normalizeStatus(order.status);
                if (currentStatus === ORDER_STATUS.DELIVERED || currentStatus === ORDER_STATUS.CANCELLED) {
                    return order;
                }

                cancelled = true;
                return {
                    ...order,
                    status: ORDER_STATUS.CANCELLED,
                    cancelledAt: Date.now(),
                };
            });

            if (cancelled) {
                setStorageData("orders", updatedOrders);
            }

            return updatedOrders;
        });

        if (!cancelled) {
            return { success: false, message: "This order can no longer be cancelled." };
        }

        return { success: true, message: "Order cancelled successfully." };
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (itemInfo && cartItems[items] > 0) {
                totalAmount += resolvePrice(itemInfo) * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [fetchProductData])

    useEffect(() => {
        fetchUserData()
    }, [])

    useEffect(() => {
        const storedCart = getStorageData("cartItems", null);
        const storedAddresses = getStorageData("userAddresses", null);
        const storedSelectedAddress = getStorageData("selectedAddress", null);
        const storedOrders = getStorageData("orders", null);
        const storedCurrencyCode = getStorageData("currencyCode", null);

        if (storedCart) setCartItems(storedCart);
        if (storedAddresses) setUserAddresses(storedAddresses);
        if (storedSelectedAddress) setSelectedAddress(storedSelectedAddress);
        if (storedCurrencyCode) setCurrencyCode(normalizeCurrencyCode(storedCurrencyCode));
        if (storedOrders) {
            const normalizedOrders = storedOrders.map((order) => ({
                ...order,
                status: normalizeStatus(order.status),
            }));
            setOrders(normalizedOrders);
        }
    }, [normalizeStatus])

    useEffect(() => {
        if (!userAddresses.length) return;
        setStorageData("userAddresses", userAddresses);
    }, [userAddresses])

    useEffect(() => {
        if (!orders.length) return;
        setStorageData("orders", orders);
    }, [orders])

    useEffect(() => {
        if (!orders.length) return;

        syncOrderStatuses();
        const intervalId = setInterval(syncOrderStatuses, 15000);

        return () => clearInterval(intervalId);
    }, [orders.length, syncOrderStatuses])

    const value = {
        // user,
        currency, currencyCode, updateCurrencyCode, currencyOptions: CURRENCY_OPTIONS, router,
        convertAmount, formatAmount,
        taxRate,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        buyNow, clearBuyNow,
        buyNowItem,
        getCheckoutItems, getCheckoutAmount, getCheckoutCount,
        userAddresses, addAddress, selectedAddress, selectAddress,
        orders, getOrderList, placeOrder, cancelOrder,
        clearCart,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}