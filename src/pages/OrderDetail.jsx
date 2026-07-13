import React, { useState } from "react";
import {
  ArrowLeft, MapPin, Package, Truck, RotateCcw,
  CheckCircle2, XCircle, CreditCard, Receipt, Box,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetOrderByIdQuery } from "../features/api/orderApi";
import { useRequestReturnMutation } from "../features/api/returnApi";

// ── Timeline ──────────────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: "placed",           label: "Order Placed",    shortLabel: "Placed",     getTime: (o) => o.createdAt },
  { key: "confirmed",        label: "Confirmed",        shortLabel: "Confirmed",  getTime: () => null },
  { key: "out_for_delivery", label: "Out for Delivery", shortLabel: "In Transit", getTime: () => null },
  { key: "delivered",        label: "Delivered",        shortLabel: "Delivered",  getTime: (o) => o.deliveredAt },
];

const STATUS_TO_IDX = { placed: 0, confirmed: 1, out_for_delivery: 2, delivered: 3 };

const OrderTimeline = ({ order }) => {
  const isCancelled = order.orderStatus === "cancelled";
  const currentIdx  = STATUS_TO_IDX[order.orderStatus] ?? 0;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-0 py-6">
        {/* Placed node */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white">
            <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
          </div>
          <p className="text-xs font-semibold text-green-600">Placed</p>
          <p className="text-[10px] text-gray-400">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
          </p>
        </div>

        <div className="mb-5 flex-1 border-t-2 border-dashed border-red-200" />

        {/* Cancelled node */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
          </div>
          <p className="text-xs font-semibold text-red-600">Cancelled</p>
          {order.cancelledAt && (
            <p className="text-[10px] text-gray-400">
              {new Date(order.cancelledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-6">
      <div className="flex min-w-[300px] items-start sm:min-w-0">
        {TIMELINE_STEPS.map((step, idx) => {
          const isDone    = idx < currentIdx;
          const isActive  = idx === currentIdx;
          const timestamp = step.getTime(order);

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    isDone   ? "bg-green-500 text-white"
                    : isActive ? "bg-secondary text-white ring-4 ring-secondary/20"
                    : "border-2 border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  {isDone
                    ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    : <span>{idx + 1}</span>
                  }
                </div>
                <p className={`hidden max-w-[72px] text-center text-xs font-semibold leading-tight sm:block ${
                  isDone ? "text-green-600" : isActive ? "text-secondary" : "text-gray-400"
                }`}>
                  {step.label}
                </p>
                <p className={`max-w-[60px] text-center text-[11px] font-semibold leading-tight sm:hidden ${
                  isDone ? "text-green-600" : isActive ? "text-secondary" : "text-gray-400"
                }`}>
                  {step.shortLabel}
                </p>
                {timestamp && (
                  <p className="text-center text-[10px] text-gray-400">
                    {new Date(timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>

              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={`mb-[26px] min-w-[16px] flex-1 border-t-2 ${
                  currentIdx > idx ? "border-green-400" : "border-dashed border-gray-200"
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const OrderDetail = () => {
  useDocumentTitle("Order Details");
  const { id } = useParams();
  const { data, isLoading, error } = useGetOrderByIdQuery(id);
  const order = data?.order;
  const [requestReturn, { isLoading: returningOrder }] = useRequestReturnMutation();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason]     = useState("");

  if (isLoading) return <Loader className="min-h-[60vh]" message="Loading order…" />;

  if (error || !order) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-bold text-primary">Order not found</h1>
          <p className="mb-6 text-sm text-gray-500">We couldn't load this order right now.</p>
          <Link to="/my-orders" className="inline-flex rounded-2xl bg-secondary px-6 py-3 font-semibold text-white">
            Back to My Orders
          </Link>
        </div>
      </section>
    );
  }

  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const expectedDelivery =
    order.orderStatus !== "delivered" && order.orderStatus !== "cancelled"
      ? (() => {
          const d = new Date(order.createdAt);
          d.setDate(d.getDate() + 1);
          d.setHours(0, 0, 0, 0);
          return d;
        })()
      : null;

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const statusBadge = {
    delivered: "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-600",
  }[order.orderStatus] || "bg-blue-50 text-blue-600";

  const canReturn = order.orderStatus === "delivered" && (() => {
    const at = order.deliveredAt || order.updatedAt;
    return at ? Date.now() - new Date(at).getTime() < 24 * 60 * 60 * 1000 : false;
  })();

  return (
    <section className="page-shell">
      <div className="app-shell max-w-2xl space-y-5">

        {/* Back */}
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          Back to My Orders
        </Link>

        {/* ── Order header card ── */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {/* Accent bar */}
          <div className={`h-1 w-full ${
            order.orderStatus === "delivered" ? "bg-green-500"
            : order.orderStatus === "cancelled" ? "bg-red-400"
            : "bg-secondary"
          }`} />

          <div className="px-5 pt-5 pb-4">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Order</p>
                <h1 className="mt-0.5 text-xl font-extrabold text-gray-900">
                  #{order._id.slice(-8).toUpperCase()}
                </h1>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`shrink-0 rounded-2xl px-3.5 py-1.5 text-xs font-bold capitalize ${statusBadge}`}>
                {order.orderStatus.replace(/_/g, " ")}
              </span>
            </div>

            {/* Timeline */}
            <div className="mt-2 border-t border-gray-100">
              <OrderTimeline order={order} />
            </div>

            {/* Info strip */}
            <div className="divide-x divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/60 grid grid-cols-3">
              <div className="flex flex-col items-center gap-0.5 px-3 py-3.5 text-center">
                <CreditCard className="mb-1 h-4 w-4 text-gray-400" strokeWidth={1.75} aria-hidden />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Payment</p>
                <p className="text-sm font-bold capitalize text-gray-800">{order.paymentMethod}</p>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-3 py-3.5 text-center">
                <Receipt className="mb-1 h-4 w-4 text-gray-400" strokeWidth={1.75} aria-hidden />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</p>
                <p className={`text-sm font-bold capitalize ${order.paymentStatus === "paid" ? "text-green-600" : "text-amber-500"}`}>
                  {order.paymentStatus}
                </p>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-3 py-3.5 text-center">
                <Box className="mb-1 h-4 w-4 text-gray-400" strokeWidth={1.75} aria-hidden />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Items</p>
                <p className="text-sm font-bold text-gray-800">{totalItems}</p>
              </div>
            </div>

            {/* Expected delivery */}
            {expectedDelivery && (
              <div className="mt-2 flex items-center gap-3 rounded-2xl bg-secondary/5 px-4 py-3.5">
                <Truck className="h-4 w-4 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary/50">Expected Delivery</p>
                  <p className="text-sm font-bold text-secondary">
                    {today >= expectedDelivery
                      ? "Arriving Today"
                      : expectedDelivery.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Items ── */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10">
              <Package className="h-4 w-4 text-secondary" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="font-bold text-gray-900">Items Ordered</h2>
            <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
              {order.items.length}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F5EFE4] p-1.5">
                  <img
                    src={item.image || "https://placehold.co/100"}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty {item.quantity} × {formatCurrency(item.price)}</p>
                </div>
                <p className="shrink-0 font-bold text-gray-800">{formatCurrency(item.quantity * item.price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Delivery address ── */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10">
              <MapPin className="h-4 w-4 text-secondary" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="font-bold text-gray-900">Delivery Address</h2>
          </div>
          <div className="px-5 py-4 text-sm leading-7 text-gray-600">
            <p className="font-semibold text-gray-800">{order.address?.street}</p>
            <p>{order.address?.city}, {order.address?.state}</p>
            <p className="text-gray-400">{order.address?.pincode}</p>
          </div>
        </div>

        {/* ── Delivery attempts ── */}
        {order.deliveryAttempts?.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10">
                <Truck className="h-4 w-4 text-secondary" strokeWidth={1.75} aria-hidden />
              </div>
              <h2 className="font-bold text-gray-900">Delivery Activity</h2>
            </div>
            <ol className="divide-y divide-gray-100">
              {order.deliveryAttempts.map((attempt, i) => (
                <li key={i} className="flex gap-4 px-5 py-4">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    attempt.status === "delivered" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>
                    {attempt.status === "delivered"
                      ? <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                      : <XCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold capitalize text-gray-800">{attempt.status}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(attempt.attemptDate).toLocaleDateString("en-IN", {
                        weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    {attempt.reason && <p className="mt-1 text-sm text-gray-500">Reason: {attempt.reason}</p>}
                    {attempt.notes  && <p className="mt-0.5 text-sm text-gray-400">{attempt.notes}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Order summary ── */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">Order Summary</h2>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({totalItems} items)</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 font-extrabold text-gray-900">
              <span>Total Paid</span>
              <span className="text-lg text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* ── Return request ── */}
        {canReturn && (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10">
                <RotateCcw className="h-4 w-4 text-secondary" strokeWidth={1.75} aria-hidden />
              </div>
              <h2 className="font-bold text-gray-900">Request Return</h2>
            </div>
            <div className="px-5 py-4">
              {!showReturnForm ? (
                <>
                  <p className="mb-4 text-sm text-gray-500">
                    Issue with your order? You can request a return within 24 hours of delivery.
                  </p>
                  <button
                    onClick={() => setShowReturnForm(true)}
                    className="w-full rounded-2xl border-2 border-secondary py-3 text-sm font-bold text-secondary transition hover:bg-secondary hover:text-white"
                  >
                    Request Return
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    rows={3}
                    placeholder="Describe the issue (e.g., damaged product, wrong item)…"
                    className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!returnReason.trim()) { toast.error("Please describe the issue."); return; }
                        try {
                          await requestReturn({ orderId: order._id, reason: returnReason.trim() }).unwrap();
                          toast.success("Return request submitted.");
                          setShowReturnForm(false);
                          setReturnReason("");
                        } catch (err) {
                          toast.error(err?.data?.message || "Failed to submit return request.");
                        }
                      }}
                      disabled={returningOrder}
                      className="flex-1 rounded-2xl bg-secondary py-3 text-sm font-bold text-white transition disabled:opacity-60"
                    >
                      {returningOrder ? "Submitting…" : "Submit"}
                    </button>
                    <button
                      onClick={() => { setShowReturnForm(false); setReturnReason(""); }}
                      className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default OrderDetail;
