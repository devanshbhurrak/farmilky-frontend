import React from "react";
import toast from "react-hot-toast";
import { FaArrowLeft, FaCalendarAlt, FaFileInvoiceDollar } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useGetMyInvoicesQuery } from "../features/api/invoiceApi";
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionByIdQuery,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
} from "../features/api/subscriptionApi";

const SubscriptionDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSubscriptionByIdQuery(id);
  const { data: invoiceData } = useGetMyInvoicesQuery();
  const [pauseSubscription] = usePauseSubscriptionMutation();
  const [resumeSubscription] = useResumeSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();

  const subscription = data?.subscription;
  const invoices = (invoiceData?.invoices || []).filter(
    (invoice) => invoice.subscriptionId === id || invoice.subscriptionId?._id === id
  );

  if (isLoading) {
    return (
      <section className="min-h-screen bg-background py-16">
        <Loader />
      </section>
    );
  }

  if (error || !subscription) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="surface-card max-w-md p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-primary">
            Subscription not found
          </h1>
          <p className="mb-6 text-gray-600">
            We couldn&apos;t load this subscription right now.
          </p>
          <Link
            to="/subscriptions"
            className="inline-flex rounded-xl bg-secondary px-6 py-3 font-semibold text-white"
          >
            Back to My Subscriptions
          </Link>
        </div>
      </section>
    );
  }

  const handlePause = async () => {
    await pauseSubscription(subscription._id).unwrap();
    toast.success("Subscription paused");
  };

  const handleResume = async () => {
    await resumeSubscription(subscription._id).unwrap();
    toast.success("Subscription resumed");
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }
    await cancelSubscription(subscription._id).unwrap();
    toast.success("Subscription cancelled");
  };

  return (
    <section className="page-shell">
      <div className="app-shell max-w-6xl space-y-6">
        <Link
          to="/subscriptions"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"
        >
          <FaArrowLeft className="text-xs" />
          Back to My Subscriptions
        </Link>

        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 border-b border-gray-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="surface-panel flex h-20 w-20 items-center justify-center p-3">
                <img
                  src={subscription.productId.image}
                  alt={subscription.productId.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">
                  Subscription Details
                </p>
                <h1 className="text-3xl font-bold text-primary">
                  {subscription.productId.name}
                </h1>
                <p className="mt-1 text-gray-500">
                  Started on {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex h-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                subscription.status === "active"
                  ? "bg-green-100 text-green-700"
                  : subscription.status === "paused"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {subscription.status}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="surface-panel p-4">
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="mt-1 font-semibold text-gray-800">
                {subscription.quantityPerDay} {subscription.productId.unit}
              </p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="mt-1 font-semibold capitalize text-gray-800">
                {subscription.deliverySchedule}
              </p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-sm text-gray-500">Daily Cost</p>
              <p className="mt-1 font-semibold text-gray-800">
                Rs. {subscription.totalPricePerDay}
              </p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-sm text-gray-500">Pending Amount</p>
              <p className="mt-1 font-semibold text-red-600">
                Rs. {subscription.pendingAmount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="surface-card p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <FaCalendarAlt className="text-secondary" />
                <h2 className="text-2xl font-bold text-primary">Delivery Timeline</h2>
              </div>

              <div className="surface-panel mb-6 p-4">
                <p className="text-sm text-gray-500">Next Delivery</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {new Date(subscription.nextDeliveryDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {subscription.customDays?.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Custom days: {subscription.customDays.join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {subscription.deliveryHistory?.length > 0 ? (
                  [...subscription.deliveryHistory].reverse().map((log, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(log.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.quantityDelivered} unit(s) delivered
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-primary">
                          Rs. {log.totalAmount}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rate: Rs. {log.pricePerUnit}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="surface-panel p-6 text-center text-gray-500">
                    No delivery history available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="surface-card p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <FaFileInvoiceDollar className="text-secondary" />
                <h2 className="text-2xl font-bold text-primary">Related Invoices</h2>
              </div>

              <div className="space-y-4">
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <div key={invoice._id} className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Invoice #{invoice._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500">{invoice.month}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-primary">
                            Rs. {invoice.totalAmount}
                          </p>
                          <p className="text-sm capitalize text-gray-500">
                            {invoice.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="surface-panel p-6 text-center text-gray-500">
                    No invoices generated for this subscription yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-card p-6">
              <h2 className="text-xl font-bold text-primary">Product Snapshot</h2>
              <p className="mt-4 text-gray-700">{subscription.productId.name}</p>
              <p className="mt-1 text-sm text-gray-500">
                Rs. {subscription.productId.price} / {subscription.productId.unit}
              </p>
            </div>

            <div className="surface-card p-6">
              <h2 className="text-xl font-bold text-primary">Actions</h2>
              <div className="mt-4 grid gap-3">
                {subscription.status === "active" && (
                  <button
                    onClick={handlePause}
                    className="rounded-xl border border-orange-100 bg-orange-50 py-3 font-semibold text-orange-600"
                  >
                    Pause Delivery
                  </button>
                )}
                {subscription.status === "paused" && (
                  <button
                    onClick={handleResume}
                    className="rounded-xl border border-green-100 bg-green-50 py-3 font-semibold text-green-600"
                  >
                    Resume Delivery
                  </button>
                )}
                {subscription.status !== "cancelled" && (
                  <button
                    onClick={handleCancel}
                    className="rounded-xl border border-red-100 bg-red-50 py-3 font-semibold text-red-600"
                  >
                    Cancel Subscription
                  </button>
                )}
                <Link
                  to="/order"
                  className="rounded-xl bg-secondary py-3 text-center font-semibold text-white"
                >
                  Add Another Product
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionDetail;
