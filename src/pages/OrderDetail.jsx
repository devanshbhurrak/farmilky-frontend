import React, { useState } from "react";
import { ArrowLeft, MapPin, Package, Truck, RotateCcw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useGetOrderByIdQuery } from "../features/api/orderApi";
import { useRequestReturnMutation } from "../features/api/returnApi";

const OrderDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetOrderByIdQuery(id);
  const order = data?.order;
  const [requestReturn, { isLoading: returningOrder }] = useRequestReturnMutation();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  if (isLoading) {
    return (
      <section className="min-h-screen bg-background py-16">
        <Loader />
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="surface-card max-w-md p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-primary">Order not found</h1>
          <p className="mb-6 text-gray-600">
            We couldn&apos;t load this order right now.
          </p>
          <Link
            to="/my-orders"
            className="inline-flex rounded-xl bg-secondary px-6 py-3 font-semibold text-white"
          >
            Back to My Orders
          </Link>
        </div>
      </section>
    );
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const expectedDelivery =
    order.orderStatus !== "delivered" && order.orderStatus !== "cancelled"
      ? (() => {
          const expected = new Date(order.createdAt);
          expected.setDate(expected.getDate() + 1);
          expected.setHours(0, 0, 0, 0);
          return expected;
        })()
      : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <section className="page-shell">
      <div className="app-shell max-w-5xl space-y-6">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Back to My Orders
        </Link>

        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-row items-start justify-between gap-5 border-b border-gray-100 pb-6">
            <div className="hidden md:block">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                Order Details
              </p>
              <h1 className="text-2xl font-bold text-primary">Order #{order._id.slice(-8).toUpperCase()}</h1>
              <p className="mt-2 text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <span
              className={`inline-flex h-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                order.orderStatus === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.orderStatus === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-50 text-blue-600"
              }`}
            >
              {order.orderStatus}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="surface-panel p-4">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="mt-1 font-semibold text-gray-800">{order.paymentMethod}</p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className="mt-1 font-semibold text-gray-800">{order.paymentStatus}</p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-sm text-gray-500">Items</p>
              <p className="mt-1 font-semibold text-gray-800">{totalItems}</p>
            </div>
            {expectedDelivery && (
              <div className="surface-panel p-4 md:col-span-3">
                <p className="text-sm text-gray-500">Expected Delivery</p>
                <p className="mt-1 font-semibold text-secondary">
                  {today >= expectedDelivery
                    ? "Arriving Today"
                    : expectedDelivery.toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="surface-card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Package className="h-6 w-6 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
              <h2 className="text-2xl font-bold text-primary">Items in this order</h2>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4"
                >
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-2">
                    <img
                      src={item.image || "https://placehold.co/100"}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} x Rs. {item.price}
                    </p>
                  </div>
                  <p className="text-right font-semibold text-primary">
                    Rs. {item.quantity * item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {order.deliveryAttempts?.length > 0 && (
            <div className="surface-card p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <Truck className="h-6 w-6 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                <h2 className="text-2xl font-bold text-primary">Delivery Activity</h2>
              </div>
              <ol className="space-y-3">
                {order.deliveryAttempts.map((attempt, i) => (
                  <li key={i} className="flex gap-4 rounded-2xl border border-gray-100 p-4">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        attempt.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {attempt.status === "delivered" ? "✓" : "✗"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold capitalize text-gray-800">{attempt.status}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(attempt.attemptDate).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {attempt.reason && (
                        <p className="mt-1 text-sm text-gray-600">Reason: {attempt.reason}</p>
                      )}
                      {attempt.notes && (
                        <p className="mt-0.5 text-sm text-gray-500">{attempt.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <aside className="space-y-6">
            <div className="surface-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <MapPin className="h-6 w-6 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                <h2 className="text-xl font-bold text-primary">Delivery Address</h2>
              </div>
              <p className="leading-7 text-gray-700">
                {order.address?.street}
                <br />
                {order.address?.city}, {order.address?.state}
                <br />
                {order.address?.pincode}
              </p>
            </div>

            <div className="surface-card p-6">
              <h2 className="text-xl font-bold text-primary">Summary</h2>
              <div className="mt-4 space-y-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-bold text-primary">
                  <span>Total</span>
                  <span>Rs. {order.totalAmount}</span>
                </div>
              </div>
            </div>

            {order.orderStatus === "delivered" && (() => {
              const deliveredAt = order.deliveredAt || order.updatedAt;
              const withinWindow = deliveredAt
                ? Date.now() - new Date(deliveredAt).getTime() < 24 * 60 * 60 * 1000
                : false;
              if (!withinWindow) return null;
              return (
                <div className="surface-card p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                    <h2 className="text-xl font-bold text-primary">Request Return</h2>
                  </div>
                  {!showReturnForm ? (
                    <>
                      <p className="mb-3 text-sm text-gray-500">
                        Issue with your order? Request a return within 24 hours of delivery.
                      </p>
                      <button
                        onClick={() => setShowReturnForm(true)}
                        className="w-full rounded-xl border border-secondary py-2.5 text-sm font-semibold text-secondary transition hover:bg-secondary hover:text-white"
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
                        placeholder="Describe the issue (e.g., damaged product, wrong item)..."
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 transition focus:border-secondary focus:outline-none"
                      />
                      <div className="flex gap-2">
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
                          className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                        >
                          {returningOrder ? "Submitting..." : "Submit"}
                        </button>
                        <button
                          onClick={() => { setShowReturnForm(false); setReturnReason(""); }}
                          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </aside>
        </div>
      </div>
    </section>
  );
};

export default OrderDetail;
