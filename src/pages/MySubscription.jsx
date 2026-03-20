import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetUserSubscriptionsQuery,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useCancelSubscriptionMutation,
} from "../features/api/subscriptionApi";
import { useGetMyInvoicesQuery } from "../features/api/invoiceApi";
import toast from "react-hot-toast";

const MySubscriptions = () => {
  const { data, isLoading, error } = useGetUserSubscriptionsQuery();
  const { data: invoiceData } = useGetMyInvoicesQuery();

  const [pauseSubscription] = usePauseSubscriptionMutation();
  const [resumeSubscription] = useResumeSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();

  const [selectedSub, setSelectedSub] = useState(null);
  const [activeTab, setActiveTab] = useState("deliveries");

  if (isLoading) {
    return (
      <section className="bg-[#F9F5F0] min-h-screen py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[2rem] p-6 h-[400px] animate-pulse border border-white/50 shadow-sm"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F5F0] text-red-500 font-medium">
        Failed to load subscriptions. Please try again later.
      </div>
    );
  }

  const subscriptions = data?.subscription || [];
  const invoices = invoiceData?.invoices || [];

  const handleOpenHistory = (sub) => {
    setSelectedSub(sub);
    setActiveTab("deliveries");
  };

  const closeHistory = () => {
    setSelectedSub(null);
  };

  if (subscriptions.length === 0) {
    return (
      <section className="min-h-screen bg-[#F9F5F0] flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-4xl">
            🥛
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            No Active Subscriptions
          </h2>
          <p className="text-gray-600 mb-8">
            You haven’t subscribed to any products yet. Fresh milk is just a click
            away!
          </p>
          <Link
            to="/order"
            className="inline-block bg-secondary text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#E67000] transition shadow-lg shadow-secondary/20"
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#F9F5F0] min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-primary">
              My Subscriptions
            </h1>
            <p className="text-gray-600 mt-2">Manage your daily deliveries</p>
          </div>
          <Link
            to="/order"
            className="text-secondary font-semibold hover:underline"
          >
            + Add New Subscription
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className={`bg-white rounded-[2rem] p-6 border border-white/50 shadow-xl shadow-gray-200/50 flex flex-col transition-all hover:-translate-y-1 relative overflow-hidden ${sub.status === "cancelled" ? "opacity-75 grayscale-[0.5]" : ""
                }`}
            >
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${sub.status === "active"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : sub.status === "paused"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-600 border-red-100"
                    }`}
                >
                  {sub.status}
                </span>
              </div>

              {/* Product Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-[#FDFBF8] rounded-2xl p-2 flex items-center justify-center">
                  <img
                    src={sub.productId.image}
                    alt={sub.productId.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {sub.productId.name}
                  </h2>
                  <p className="text-primary font-medium">
                    ₹{sub.productId.price}{" "}
                    <span className="text-gray-400 text-sm">
                      / {sub.productId.unit}
                    </span>
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 bg-[#F9F5F0] p-4 rounded-xl text-sm">
                <div>
                  <span className="block text-gray-500 text-xs uppercase font-bold mb-1">
                    Quantity
                  </span>
                  <span className="font-semibold text-gray-800">
                    {sub.quantityPerDay} {sub.productId.unit}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs uppercase font-bold mb-1">
                    Frequency
                  </span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {sub.deliverySchedule === "custom"
                      ? "Custom Days"
                      : sub.deliverySchedule}
                  </span>
                </div>
                <div className="col-span-2 border-t border-gray-200/50 pt-3 mt-1 flex justify-between items-center">
                  <div>
                    <span className="block text-gray-500 text-xs uppercase font-bold mb-1">
                      Next Delivery
                    </span>
                    <span className="font-semibold text-gray-800">
                      {new Date(sub.nextDeliveryDate).toLocaleDateString(
                        undefined,
                        { weekday: "long", month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-500 text-xs uppercase font-bold mb-1">
                      Current Due
                    </span>
                    <span className="font-bold text-red-600 text-lg">
                      ₹{sub.pendingAmount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-auto grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenHistory(sub)}
                  className="col-span-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 font-semibold border border-gray-100 hover:bg-gray-100 transition"
                >
                  📜 View History
                </button>

                {sub.status === "active" && (
                  <button
                    onClick={async () => {
                      await pauseSubscription(sub._id).unwrap();
                      toast.success("Subscription paused");
                    }}
                    className="col-span-2 py-2.5 rounded-xl bg-orange-50 text-orange-600 font-semibold border border-orange-100 hover:bg-orange-100 transition"
                  >
                    ⏸ Pause Delivery
                  </button>
                )}

                {sub.status === "paused" && (
                  <button
                    onClick={async () => {
                      await resumeSubscription(sub._id).unwrap();
                      toast.success("Subscription resumed");
                    }}
                    className="col-span-2 py-2.5 rounded-xl bg-green-50 text-green-600 font-semibold border border-green-100 hover:bg-green-100 transition"
                  >
                    ▶ Resume Delivery
                  </button>
                )}

                {sub.status !== "cancelled" && (
                  <button
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Are you sure you want to cancel this subscription?"
                        )
                      ) {
                        await cancelSubscription(sub._id).unwrap();
                        toast.success("Subscription cancelled");
                      }
                    }}
                    className="col-span-2 py-2.5 rounded-xl text-red-500 font-medium text-sm hover:bg-red-50 transition"
                  >
                    Cancel Subscription
                  </button>
                )}

                {sub.status === "cancelled" && (
                  <div className="col-span-2 text-center py-2 text-gray-400 text-sm font-medium bg-gray-50 rounded-xl">
                    Cancelled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Subscription History
                </h3>
                <p className="text-gray-500 text-sm">
                  {selectedSub.productId.name} • {selectedSub.status}
                </p>
              </div>
              <button
                onClick={closeHistory}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b px-6">
              <button
                onClick={() => setActiveTab("deliveries")}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${activeTab === "deliveries"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Delivery Log
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${activeTab === "invoices"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Payment History
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F9F5F0]">
              {activeTab === "deliveries" ? (
                <div className="space-y-4">
                  {selectedSub.deliveryHistory &&
                    selectedSub.deliveryHistory.length > 0 ? (
                    [...selectedSub.deliveryHistory]
                      .reverse()
                      .map((log, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(log.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Delivered successfully
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {log.quantityDelivered} Unit(s)
                            </p>
                            <p className="text-sm text-primary">
                              ₹{log.totalAmount}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p>No delivery history available yet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices && invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <div key={inv._id} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900">Invoice #{inv._id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-gray-500">{inv.month}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">
                              ₹{inv.totalAmount}
                            </p>
                            {/* Status Badge */}
                            <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                inv.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              {inv.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Partial Payment Details */}
                        {inv.status !== 'paid' && inv.amountPaid > 0 && (
                          <div className="mt-2 text-sm bg-yellow-50 p-2 rounded-lg text-yellow-800 flex justify-between">
                            <span>Paid: ₹{inv.amountPaid}</span>
                            <span className="font-semibold">Remaining: ₹{inv.totalAmount - inv.amountPaid}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p>No invoices generated yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MySubscriptions;