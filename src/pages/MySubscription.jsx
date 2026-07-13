import React, { useMemo } from "react";
import { ArrowLeft, CalendarDays, Repeat2, Package, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Loader from "../components/Loader";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetUserSubscriptionsQuery } from "../features/api/subscriptionApi";

const STATUS_CONFIG = {
  active:    { label: "Active",    classes: "bg-green-100 text-green-700",  bar: "bg-green-500"  },
  paused:    { label: "Paused",    classes: "bg-amber-100 text-amber-700",  bar: "bg-amber-400"  },
  cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-600",      bar: "bg-red-400"    },
};

const MySubscriptions = () => {
  useDocumentTitle("My Subscriptions");
  const { data, isLoading, error, refetch } = useGetUserSubscriptionsQuery();

  const subscriptions = useMemo(
    () => [...(data?.subscription || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [data?.subscription]
  );

  if (isLoading) return <Loader className="min-h-[60vh]" message="Loading your subscriptions..." />;

  if (error) return (
    <ErrorState
      title="Failed to load subscriptions"
      message="We could not fetch your active plans right now."
      onAction={refetch}
    />
  );

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        className="min-h-screen"
        title="No Active Subscriptions"
        message="You haven't subscribed to any products yet. Fresh milk is just a click away."
        actionLabel="Browse Products"
        actionTo="/order"
      />
    );
  }

  return (
    <section className="page-shell">
      <div className="app-shell max-w-2xl space-y-6">

        {/* Header */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
            Back to home
          </Link>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-primary">My Subscriptions</h1>
              <p className="mt-0.5 text-sm text-gray-500">Manage your daily deliveries</p>
            </div>
            <Link
              to="/order"
              className="shrink-0 rounded-2xl bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary transition hover:bg-secondary/20"
            >
              + Add New
            </Link>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.cancelled;
            const pricePerUnit = sub.pricePerUnit ?? (sub.quantityPerDay > 0 ? sub.totalPricePerDay / sub.quantityPerDay : 0);
            const nextDelivery = sub.nextDeliveryDate
              ? new Date(sub.nextDeliveryDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
              : "—";
            const frequency = sub.deliverySchedule === "custom" ? "Custom Days" : sub.deliverySchedule;
            const hasDue = (sub.pendingAmount || 0) > 0;

            return (
              <div
                key={sub._id}
                className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md ${
                  sub.status === "cancelled" ? "opacity-60" : ""
                }`}
              >
                {/* Accent bar */}
                <div className={`h-1 w-full ${cfg.bar}`} />

                {/* Product row */}
                <div className="flex items-center gap-4 px-5 pt-5 pb-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F5EFE4] p-2">
                    <img
                      src={sub.productId.image}
                      alt={sub.productId.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-gray-900">{sub.productId.name}</h2>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(pricePerUnit)}
                      <span className="text-gray-400"> / {sub.variantUnit || sub.productId.unit}</span>
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-2xl px-3 py-1 text-xs font-bold ${cfg.classes}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Stats strip */}
                <div className="mx-5 divide-x divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/70 grid grid-cols-3">
                  <div className="flex flex-col items-center gap-0.5 px-2 py-3 text-center">
                    <Package className="mb-0.5 h-3.5 w-3.5 text-gray-400" strokeWidth={1.75} aria-hidden />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Qty / Day</p>
                    <p className="text-sm font-bold text-gray-800">
                      {sub.quantityPerDay} <span className="text-xs font-normal text-gray-400">{sub.variantUnit || sub.productId.unit}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 px-2 py-3 text-center">
                    <Repeat2 className="mb-0.5 h-3.5 w-3.5 text-gray-400" strokeWidth={1.75} aria-hidden />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Frequency</p>
                    <p className="text-sm font-bold capitalize text-gray-800">{frequency}</p>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 px-2 py-3 text-center">
                    <CalendarDays className="mb-0.5 h-3.5 w-3.5 text-gray-400" strokeWidth={1.75} aria-hidden />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Next</p>
                    <p className="text-sm font-bold text-gray-800">{nextDelivery}</p>
                  </div>
                </div>

                {/* Due amount */}
                {hasDue && (
                  <div className="mx-5 mt-3 flex items-center gap-2.5 rounded-2xl bg-red-50 px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" strokeWidth={1.75} aria-hidden />
                    <p className="text-sm text-red-600">
                      Pending amount: <span className="font-bold">{formatCurrency(sub.pendingAmount)}</span>
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="px-5 py-4">
                  <Link
                    to={`/subscriptions/${sub._id}`}
                    className="flex items-center justify-between rounded-2xl bg-primary/5 px-5 py-3.5 font-semibold text-primary transition hover:bg-primary/10"
                  >
                    <span>Manage Subscription</span>
                    <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default MySubscriptions;
