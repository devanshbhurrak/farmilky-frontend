import React, { useMemo, useState } from "react";
import { PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetUserOrdersQuery } from "../features/api/orderApi";

const PAGE_SIZE = 5;

const MyOrders = () => {
  useDocumentTitle("My Orders")
  const { data: orderData, isLoading, error, refetch } = useGetUserOrdersQuery();
  const [page, setPage] = useState(1);
  const orders = useMemo(
    () =>
      [...(orderData?.order || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [orderData?.order]
  );
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return <Loader className="min-h-[60vh]" message="Loading your orders..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load orders"
        message="We could not fetch your order history right now."
        onAction={refetch}
      />
    );
  }

  return (
    <section className="page-shell">
      <div className="app-shell max-w-5xl">
        <h1 className="mb-5 px-2 text-2xl font-bold text-primary">My Orders</h1>

        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="It looks like you haven't placed any orders yet."
            actionLabel="Start Shopping"
            actionTo="/order"
            icon={<PackageOpen className="mx-auto h-16 w-16 text-gray-300" strokeWidth={1.25} aria-hidden />}
            className="py-0"
          />
        ) : (
          <div className="space-y-6">
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                className="surface-card rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 sm:p-6"
              >
                <div className="mb-4 flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="mb-1 text-sm text-gray-500">
                      Order ID:{" "}
                      <span className="break-all font-mono text-gray-700">
                        {order._id}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on: {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    {order.orderStatus === "delivered" ? (
                      <p className="mt-1 text-sm font-medium text-green-600">
                        Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                    ) : order.orderStatus === "cancelled" ? (
                      <p className="mt-1 text-sm font-medium text-red-500">
                        Cancelled on: {new Date(order.cancelledAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-secondary">
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const expected = new Date(order.createdAt);
                          expected.setDate(expected.getDate() + 1);
                          expected.setHours(0, 0, 0, 0);

                          return today >= expected
                            ? "Arriving Today"
                            : `Expected Delivery: ${expected.toLocaleDateString()}`;
                        })()}
                      </p>
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
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
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 p-2 sm:h-16 sm:w-16">
                        <img
                          src={item.image || "https://placehold.co/100"}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="text-right font-semibold text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <Link
                    to={`/my-orders/${order._id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrders;
