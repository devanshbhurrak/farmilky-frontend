import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Loader from "../components/Loader";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetUserSubscriptionsQuery } from "../features/api/subscriptionApi";

const MySubscriptions = () => {
  useDocumentTitle("My Subscriptions")
  const { data, isLoading, error, refetch } = useGetUserSubscriptionsQuery();

  const subscriptions = useMemo(
    () =>
      [...(data?.subscription || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [data?.subscription]
  );

  if (isLoading) {
    return (
      <Loader className="min-h-[60vh]" message="Loading your subscriptions..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load subscriptions"
        message="We could not fetch your active plans right now."
        onAction={refetch}
      />
    );
  }

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        title="No Active Subscriptions"
        message="You haven't subscribed to any products yet. Fresh milk is just a click away."
        actionLabel="Browse Products"
        actionTo="/order"
        icon={
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-2xl shadow-md">
            Milk
          </div>
        }
      />
    );
  }

  return (
      <section className="page-shell">
      <div className="app-shell">
        <div className="mb-4 flex flex-row items-center justify-between gap-3 md:mb-6">
          <div>
            <h1 className="text-xl font-bold text-primary sm:text-2xl">My Subscriptions</h1>
            <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">Manage your daily deliveries</p>
          </div>
          <Link to="/order" className="shrink-0 font-semibold text-secondary hover:underline">
            + Add New
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className={`surface-card relative flex flex-col overflow-hidden rounded-[2rem] p-6 transition-all hover:-translate-y-1 ${
                sub.status === "cancelled" ? "grayscale-[0.5] opacity-75" : ""
              }`}
            >
              <div className="absolute right-6 top-6">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    sub.status === "active"
                      ? "border-green-200 bg-green-100 text-green-700"
                      : sub.status === "paused"
                        ? "border-yellow-200 bg-yellow-100 text-yellow-700"
                        : "border-red-100 bg-red-50 text-red-600"
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <div className="mb-6 flex items-center gap-4 pr-20">
                <div className="surface-panel flex h-20 w-20 items-center justify-center p-2">
                  <img
                    src={sub.productId.image}
                    alt={sub.productId.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-gray-900">
                    {sub.productId.name}
                  </h2>
                  <p className="font-medium text-primary">
                    {formatCurrency(sub.pricePerUnit ?? (sub.quantityPerDay > 0 ? sub.totalPricePerDay / sub.quantityPerDay : 0))}
                    <span className="text-sm text-gray-400"> / {sub.variantUnit || sub.productId.unit}</span>
                  </p>
                </div>
              </div>

              <div className="surface-panel mb-8 grid grid-cols-1 gap-3 p-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Quantity
                  </span>
                  <span className="font-semibold text-gray-800">
                    {sub.quantityPerDay} {sub.variantUnit || sub.productId.unit}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Frequency
                  </span>
                  <span className="font-semibold capitalize text-gray-800">
                    {sub.deliverySchedule === "custom"
                      ? "Custom Days"
                      : sub.deliverySchedule}
                  </span>
                </div>
                <div className="border-t border-gray-200/50 pt-3 sm:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Next Delivery
                  </span>
                  <span className="font-semibold text-gray-800">
                    {new Date(sub.nextDeliveryDate).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="border-t border-gray-200/50 pt-3 sm:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Current Due
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(sub.pendingAmount || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <Link
                  to={`/subscriptions/${sub._id}`}
                  className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-center font-semibold text-primary transition hover:bg-primary/10"
                >
                  Manage Subscription
                </Link>
                <p className="mt-3 text-center text-sm text-gray-500">
                  Open details to manage this subscription.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MySubscriptions;
