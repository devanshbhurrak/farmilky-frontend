import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGetProductByIdQuery } from "../features/api/productApi";
import { useCreateSubscriptionMutation } from "../features/api/subscriptionApi";
import toast from "react-hot-toast";

const Subscription = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const productId = searchParams.get("productId");

  const { data: product, isLoading } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  const [createSubscription, { isLoading: creating }] =
    useCreateSubscriptionMutation();

  const [quantity, setQuantity] = useState(1);
  const [schedule, setSchedule] = useState("daily");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createSubscription({
        productId,
        quantityPerDay: quantity,
        deliverySchedule: schedule,
      }).unwrap();

      toast.success("Subscription started successfully!");
      navigate("/subscriptions");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to start subscription");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F5F0]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F5F0]">
        <p className="text-red-500 font-medium">Product not found.</p>
      </div>
    );
  }

  return (
    <section className="bg-[#F9F5F0] min-h-screen py-10 lg:py-20 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Back Button / Breadcrumb placeholder could go here */}

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* Left Column: Product Visuals */}
          <div className="lg:col-span-12 xl:col-span-12 text-center mb-4 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-4">
              Daily Freshness
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Subscribe to {product.name} and get farm-fresh delivery right to your doorstep every morning.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-white/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FDFBF8] to-transparent opacity-50 z-0"></div>
            <div className="relative z-10 flex flex-col items-center gap-6 text-center h-full justify-center min-h-[400px]">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl transform scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-64 h-64 object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h2>
                <div className="inline-block bg-[#F7F3ED] px-4 py-1.5 rounded-full">
                  <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                  <span className="text-gray-500 font-medium ml-1">/ {product.unit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Configuration Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-white/50">
              <form onSubmit={handleSubmit} className="space-y-10">

                {/* Quantity Control */}
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Daily Quantity
                  </label>
                  <div className="flex items-center gap-6 bg-[#F9F5F0] p-2 rounded-2xl w-max">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-14 h-14 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md text-primary text-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-16 text-center text-3xl font-bold text-gray-800 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-14 h-14 flex items-center justify-center rounded-xl bg-secondary text-white shadow-md shadow-secondary/30 hover:shadow-lg hover:shadow-secondary/40 text-2xl font-bold transition-all active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Schedule Selection - Card Style */}
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Delivery Schedule
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSchedule("daily")}
                      className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${schedule === "daily"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 absolute top-6 right-6 flex items-center justify-center transition-colors ${schedule === "daily" ? "border-primary" : "border-gray-300"
                        }`}>
                        {schedule === "daily" && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                      <span className="text-3xl mb-2 block">📅</span>
                      <span className={`block font-bold text-lg ${schedule === "daily" ? "text-primary" : "text-gray-700"}`}>Every Day</span>
                      <span className="text-sm text-gray-500">7 days a week</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSchedule("alternate")}
                      className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${schedule === "alternate"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 absolute top-6 right-6 flex items-center justify-center transition-colors ${schedule === "alternate" ? "border-primary" : "border-gray-300"
                        }`}>
                        {schedule === "alternate" && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                      <span className="text-3xl mb-2 block">🗓️</span>
                      <span className={`block font-bold text-lg ${schedule === "alternate" ? "text-primary" : "text-gray-700"}`}>Alternate Days</span>
                      <span className="text-sm text-gray-500">Every other day</span>
                    </button>
                  </div>
                </div>

                {/* Summary / Confirmation */}
                <div className="bg-[#FDFBF8] rounded-2xl p-6 border border-[#EDE6DC]">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Billing Note
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This is a postpaid subscription. You will receive <span className="font-semibold text-gray-800">{quantity} packet{quantity > 1 ? "s" : ""}</span> of {product.name} <span className="font-semibold text-gray-800">{schedule === 'daily' ? 'every day' : 'on alternate days'}</span>. We'll generate a bill at the end of each month.
                  </p>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-secondary text-white py-5 rounded-2xl font-bold text-xl hover:bg-[#E67000] hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up...
                    </span>
                  ) : (
                    "Confirm Subscription"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subscription;
