import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetProductByIdQuery } from "../features/api/productApi";
import { useCreateSubscriptionMutation } from "../features/api/subscriptionApi";

const SCHEDULES = [
  {
    value: "daily",
    title: "Every Day",
    tag: "Best For Daily Use",
    desc: "7 days a week, around 30 deliveries each month",
    deliveries: 30,
  },
  {
    value: "alternate",
    title: "Alternate Days",
    tag: "Best For Light Usage",
    desc: "Every other day, around 15 deliveries each month",
    deliveries: 15,
  },
  {
    value: "weekly",
    title: "Once a Week",
    tag: "Best For Occasional Use",
    desc: "One delivery per week, around 4 deliveries each month",
    deliveries: 4,
  },
];

const todayStr = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const Subscription = () => {
  useDocumentTitle("Subscribe")
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("productId");
  const initialQuantity = useMemo(() => {
    const parsed = Number.parseInt(searchParams.get("quantity") || "1", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const variantId = searchParams.get("variantId");

  const { data: product, isLoading } = useGetProductByIdQuery(productId, { skip: !productId });
  const [createSubscription, { isLoading: creating }] = useCreateSubscriptionMutation();

  const [quantity, setQuantity] = useState(initialQuantity);
  const [schedule, setSchedule] = useState("daily");
  const [startDate, setStartDate] = useState(todayStr());

  const selectedVariant = variantId && product?.variants?.length > 0
    ? product.variants.find(v => String(v._id) === variantId)
    : null;
  const effectivePrice = selectedVariant
    ? (selectedVariant.discountedPrice ?? selectedVariant.price)
    : (product?.price ?? 0);

  const selectedSchedule = SCHEDULES.find((s) => s.value === schedule);
  const estimatedDeliveries = selectedSchedule?.deliveries ?? 30;
  const estimatedMonthlyCost = product ? effectivePrice * quantity * estimatedDeliveries : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productId,
        quantityPerDay: Number(quantity),
        quantity: Number(quantity),
        deliverySchedule: schedule,
      };
      if (variantId) payload.variantId = variantId;
      if (startDate && startDate !== todayStr()) {
        payload.startDate = startDate;
      }
      await createSubscription(payload).unwrap();
      toast.success("Subscription started successfully!");
      navigate("/subscriptions");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to start subscription");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent" aria-hidden />
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
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            Daily Freshness
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-gray-500 sm:text-base">
            Subscribe to {product.name} and get farm-fresh delivery right to your doorstep.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Product card */}
          <div className="overflow-hidden rounded-[2.5rem] border border-white/50 bg-white p-6 shadow-xl shadow-gray-200/50 lg:col-span-5 sm:p-8">
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 text-center sm:min-h-[400px]">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-52 w-52 object-contain drop-shadow-2xl sm:h-64 sm:w-64"
              />
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
                <div className="inline-block rounded-full bg-[#F7F3ED] px-4 py-1.5">
                  <span className="text-2xl font-bold text-primary">{formatCurrency(effectivePrice)}</span>
                  <span className="ml-1 font-medium text-gray-500">/ {selectedVariant ? selectedVariant.label : product.unit}</span>
                  {selectedVariant?.discountedPrice != null && selectedVariant.discountedPrice < selectedVariant.price && (
                    <span className="ml-2 text-sm text-gray-400 line-through">{formatCurrency(selectedVariant.price)}</span>
                  )}
                </div>
                {selectedVariant && (
                  <p className="text-sm text-gray-500">Selected: {selectedVariant.label}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[2.5rem] border border-white/50 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">

                {/* Quantity */}
                <div>
                  <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-500">
                    Daily Quantity
                  </label>
                  <div className="surface-panel flex w-full items-center justify-between gap-3 p-2 sm:w-max sm:gap-6">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-bold text-primary shadow-sm transition-all active:scale-95 disabled:opacity-50 sm:h-14 sm:w-14"
                    >
                      -
                    </button>
                    <span className="w-16 text-center text-3xl font-bold text-gray-800">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      disabled={quantity >= 20}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl font-bold text-white shadow-md shadow-secondary/30 transition-all active:scale-95 disabled:opacity-50 sm:h-14 sm:w-14"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-500">
                    Delivery Schedule
                  </label>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {SCHEDULES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSchedule(s.value)}
                        className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                          schedule === s.value
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <div
                          className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            schedule === s.value ? "border-primary" : "border-gray-300"
                          }`}
                        >
                          {schedule === s.value && (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {s.tag}
                        </span>
                        <span className={`block text-base font-bold ${schedule === s.value ? "text-primary" : "text-gray-700"}`}>
                          {s.title}
                        </span>
                        <span className="text-xs text-gray-500">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start date */}
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={todayStr()}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 transition focus:border-secondary focus:outline-none sm:w-auto"
                  />
                  {startDate !== todayStr() && (
                    <p className="mt-1 text-xs text-gray-500">
                      First delivery on{" "}
                      {new Date(startDate).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="grid gap-4 rounded-2xl border border-[#E7DED2] bg-[#FCFAF7] p-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Daily Quantity</p>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {quantity} packet{quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Est. Deliveries</p>
                    <p className="mt-1 text-lg font-bold text-primary">{estimatedDeliveries} / month</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Est. Monthly Cost</p>
                    <p className="mt-1 text-lg font-bold text-secondary">{formatCurrency(estimatedMonthlyCost)}</p>
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
                      {schedule === "daily"
                        ? "every day"
                        : schedule === "alternate"
                        ? "on alternate days"
                        : "once a week"}
                    </span>
                    {startDate !== todayStr() && (
                      <>
                        {" "}starting from{" "}
                        <span className="font-semibold text-gray-800">
                          {new Date(startDate).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    . Your estimated bill is around{" "}
                    <span className="font-semibold text-gray-800">{formatCurrency(estimatedMonthlyCost)}</span> per month.
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
