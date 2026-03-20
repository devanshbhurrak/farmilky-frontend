import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateOrderMutation } from "../features/api/orderApi";
import { useGetCartQuery } from "../features/api/cartApi";
import { useUpdateProfileMutation, useGetUserProfileQuery } from "../features/api/authApi"; // Import updateProfile and getUserProfile
import toast from "react-hot-toast";

const Checkout = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    
    // Fetch latest profile data to ensure addresses are up to date
    useGetUserProfileQuery(undefined, {
        skip: !user,
        refetchOnMountOrArgChange: true 
    });

    const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(undefined, {
        skip: !user
    });

    const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();
    const [updateProfile] = useUpdateProfileMutation(); // Hook for updating profile

    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [selectedSavedKey, setSelectedSavedKey] = useState(null); // Track selected saved address
    const [saveAddress, setSaveAddress] = useState(true); // Checkbox state
    const [paymentMethod, setPaymentMethod] = useState("COD");

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
        setSelectedSavedKey(null); // Deselect if user edits manually
    };

    const handleSelectSaved = (savedAddr, index) => {
        setAddress({
            street: savedAddr.street,
            city: savedAddr.city,
            state: savedAddr.state,
            pincode: savedAddr.pincode,
        });
        setSelectedSavedKey(index);
        setSaveAddress(false); // Don't save an already saved address
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!address.street || !address.city || !address.state || !address.pincode) {
            toast.error("Please fill in all address fields");
            return;
        }

        try {
            // 1. Create Order
            const res = await createOrder({
                address,
                paymentMethod
            }).unwrap();

            // 2. Save Address if requested (and not just selected from list)
            if (saveAddress) {
                const newAddresses = user.addresses ? [...user.addresses, { ...address, type: 'other' }] : [{ ...address, type: 'home' }];
                try {
                     await updateProfile({ addresses: newAddresses }).unwrap();
                     // Toast handled by mutation typically or just silent success
                } catch (err) {
                    console.error("Failed to save address", err);
                    // Don't block order success for this
                }
            }

            toast.success("Order placed successfully!");
            navigate(`/order-success/${res.order._id}`);
        } catch (error) {
            console.error("Order process failed:", error);
            toast.error(error?.data?.message || "Failed to place order");
        }
    };

    if (!user) return <div className="text-center py-20">Please login to checkout</div>;
    if (isCartLoading) return <div className="text-center py-20">Loading...</div>;

    const cartItems = cartData?.items || [];
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.productId.price * item.quantity), 0);

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#F9F5F0]">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <button onClick={() => navigate('/order')} className="bg-secondary text-white px-6 py-2 rounded-xl">
                    Continue Shopping
                </button>
            </div>
        )
    }

    return (
        <section className="bg-[#F9F5F0] min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* LEFT COLUMN - ADDRESS FORM */}
                <div className="bg-white p-8 rounded-3xl shadow-sm h-fit">
                    <h2 className="text-2xl font-bold text-primary mb-6">Shipping Details</h2>
                    
                    {/* SAVED ADDRESSES */}
                    {user.addresses && user.addresses.length > 0 && (
                        <div className="mb-8">
                            <p className="text-sm font-semibold text-gray-500 mb-3">Saved Addresses</p>
                            <div className="grid grid-cols-1 gap-3">
                                {user.addresses.map((addr, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => handleSelectSaved(addr, idx)}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center gap-3
                                            ${selectedSavedKey === idx ? 'border-secondary bg-secondary/5' : 'border-gray-100 hover:border-gray-200'}
                                        `}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                                            ${selectedSavedKey === idx ? 'border-secondary' : 'border-gray-300'}
                                        `}>
                                            {selectedSavedKey === idx && <div className="w-2 h-2 rounded-full bg-secondary"></div>}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{addr.type.toUpperCase()}</p>
                                            <p className="text-sm text-gray-600 line-clamp-1">
                                                {addr.street}, {addr.city} - {addr.pincode}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-600 mb-1">Street Address</label>
                            <input
                                type="text"
                                name="street"
                                value={address.street}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition"
                                placeholder="House No, Street Name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-600 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={address.pincode}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition"
                                    placeholder="123456"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                value={address.state}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition"
                                placeholder="State"
                            />
                        </div>

                        {/* SAVE ADDRESS CHECKBOX */}
                         <div className="flex items-center gap-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="saveAddress"
                                checked={saveAddress}
                                onChange={(e) => setSaveAddress(e.target.checked)}
                                disabled={selectedSavedKey !== null} // Disable if a saved address is selected
                                className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                            />
                            <label htmlFor="saveAddress" className={`text-sm ${selectedSavedKey !== null ? 'text-gray-400' : 'text-gray-700'}`}>
                                Save this address for future orders
                            </label>
                        </div> 

                        <div className="pt-6">
                            <h3 className="text-xl font-bold text-primary mb-4">Payment Method</h3>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("COD")}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition ${paymentMethod === "COD" ? "border-secondary text-secondary bg-secondary/5" : "border-gray-200 text-gray-500"}`}
                                >
                                    Cash on Delivery
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-100 text-gray-400 cursor-not-allowed"
                                    disabled
                                >
                                    Online (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN - ORDER SUMMARY */}
                <div className="bg-white p-8 rounded-3xl shadow-sm h-fit">
                    <h2 className="text-2xl font-bold text-primary mb-6">Order Summary</h2>
                    <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {cartItems.map((item) => {
                            if (!item.productId) return null; // Skip rendering if product was deleted
                            return (
                                <div key={item.productId._id} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {/* Ideally replace with actual image */}
                                        <img src={item.productId.image || "https://placehold.co/100"} alt={item.productId.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800">{item.productId.name}</h4>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">₹{item.productId.price * item.quantity}</p>
                                </div>
                            )
                        })}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2 text-gray-600">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span className="text-green-600">Free</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-xl font-bold text-primary mb-8">
                        <span>Total</span>
                        <span>₹{totalAmount}</span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isOrdering}
                        className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isOrdering ? "Processing..." : `Place Order (₹${totalAmount})`}
                    </button>
                </div>

            </div>
        </section>
    );
};

export default Checkout;
