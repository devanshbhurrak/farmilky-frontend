import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetProductByIdQuery } from "../features/api/productApi";
import { useCreateSubscriptionMutation } from "../features/api/subscriptionApi";

const Subscription = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("productId");
  const initialQuantity = useMemo(() => {
    const parsedQuantity = Number.parseInt(searchParams.get("quantity") || "1", 10);
    return Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
  }, [searchParams]);

  const { data: product, isLoading } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  const [createSubscription, { isLoading: creating }] =
    useCreateSubscriptionMutation();

  const [quantity, setQuantity] = useState(initialQuantity);
  const [schedule, setSchedule] = useState("daily");
  const estimatedDeliveries = schedule === "daily" ? 30 : 15;
  const estimatedMonthlyCost = product
    ? product.price * quantity * estimatedDeliveries
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createSubscription({
        productId,
        quantityPerDay: Number(quantity),
        quantity: Number(quantity),
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-medium text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <p className="font-medium text-red-500">Product not found.</p>
      </div>
    );
  }

  return (
    <section className="page-shell transition-colors duration-300 lg:py-16">
      <div className="app-shell max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Daily Freshness
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
            Subscribe to {product.name} and get farm-fresh delivery right to
            your doorstep every morning.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/50 bg-white p-6 shadow-xl shadow-gray-200/50 lg:col-span-5 sm:p-8">
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 text-center sm:min-h-[400px]">
              <img
                src={product.image}
                alt={product.name}
                className="h-52 w-52 object-contain drop-shadow-2xl sm:h-64 sm:w-64"
              />

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
                <div className="inline-block rounded-full bg-[#F7F3ED] px-4 py-1.5">
                  <span className="text-2xl font-bold text-primary">
                    Rs. {product.price}
                  </span>
                  <span className="ml-1 font-medium text-gray-500">
                    / {product.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[2.5rem] border border-white/50 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">

                <div>
                  <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-500">
                    Daily Quantity
                  </label>
                  <div className="surface-panel flex w-full items-center justify-between gap-3 p-2 sm:w-max sm:gap-6">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-bold text-primary shadow-sm transition-all active:scale-95 disabled:opacity-50 sm:h-14 sm:w-14"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-16 text-center text-3xl font-bold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl font-bold text-white shadow-md shadow-secondary/30 transition-all active:scale-95 sm:h-14 sm:w-14"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-500">
                    Delivery Schedule
                  </label>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setSchedule("daily")}
                      className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
                        schedule === "daily"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          schedule === "daily" ? "border-primary" : "border-gray-300"
                        }`}
                      >
                        {schedule === "daily" && (
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Best For Daily Use
                      </span>
                      <span
                        className={`block text-lg font-bold ${
                          schedule === "daily" ? "text-primary" : "text-gray-700"
                        }`}
                      >
                        Every Day
                      </span>
                      <span className="text-sm text-gray-500">
                        7 days a week, around 30 deliveries each month
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSchedule("alternate")}
                      className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
                        schedule === "alternate"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          schedule === "alternate"
                            ? "border-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {schedule === "alternate" && (
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Best For Light Usage
                      </span>
                      <span
                        className={`block text-lg font-bold ${
                          schedule === "alternate"
                            ? "text-primary"
                            : "text-gray-700"
                        }`}
                      >
                        Alternate Days
                      </span>
                      <span className="text-sm text-gray-500">
                        Every other day, around 15 deliveries each month
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 rounded-2xl border border-[#E7DED2] bg-[#FCFAF7] p-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Daily Quantity
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {quantity} packet{quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Estimated Deliveries
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {estimatedDeliveries} / month
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Estimated Monthly Cost
                    </p>
                    <p className="mt-1 text-lg font-bold text-secondary">
                      Rs. {estimatedMonthlyCost}
                    </p>
                  </div>
                </div>

                <div className="surface-panel p-6">
                  <h4 className="mb-2 font-semibold text-primary">Plan Summary</h4>
                  <p className="text-sm leading-relaxed text-gray-600">
                    This is a postpaid subscription. You will receive{" "}
                    <span className="font-semibold text-gray-800">
                      {quantity} packet{quantity > 1 ? "s" : ""}
                    </span>{" "}
                    of {product.name}{" "}
                    <span className="font-semibold text-gray-800">
                      {schedule === "daily" ? "every day" : "on alternate days"}
                    </span>
                    . Based on this plan, your bill should be around{" "}
                    <span className="font-semibold text-gray-800">
                      Rs. {estimatedMonthlyCost}
                    </span>{" "}
                    per month. We&apos;ll generate the final bill at the end of each month.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-2xl bg-secondary py-4 text-lg font-bold text-white transition-all disabled:opacity-70"
                >
                  {creating ? "Setting up..." : "Confirm Subscription"}
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
