import React, { useMemo, useState } from "react";
import {
  ArrowLeft, PackageOpen, CalendarDays, Clock3, ChevronRight,
  Truck, CheckCircle2, XCircle, Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetUserOrdersQuery } from "../features/api/orderApi";

const PAGE_SIZE = 5;

const STATUS_FILTERS = [
  { value: "all",       label: "All Orders" },
  { value: "active",    label: "Active" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_CONFIG = {
  delivered: { label: "Delivered", icon: CheckCircle2, iconBg: "bg-green-100",  iconColor: "text-green-600", labelColor: "text-green-700", bar: "bg-green-500" },
  cancelled: { label: "Cancelled", icon: XCircle,      iconBg: "bg-red-100",    iconColor: "text-red-500",   labelColor: "text-red-600",   bar: "bg-red-400"   },
  confirmed: { label: "Confirmed", icon: Truck,        iconBg: "bg-blue-50",    iconColor: "text-blue-500",  labelColor: "text-blue-600",  bar: "bg-blue-500"  },
  placed:    { label: "Placed",    icon: Package,      iconBg: "bg-amber-50",   iconColor: "text-amber-500", labelColor: "text-amber-600", bar: "bg-amber-400" },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || {
    label: status, icon: Package,
    iconBg: "bg-gray-100", iconColor: "text-gray-500", labelColor: "text-gray-600", bar: "bg-gray-300",
  };
}

function getDeliveryLine(order) {
  if (order.orderStatus === "delivered") {
    return {
      text: order.deliveredAt
        ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
        : "Delivered",
      color: "text-green-600",
    };
  }
  if (order.orderStatus === "cancelled") {
    return {
      text: order.cancelledAt
        ? `Cancelled on ${new Date(order.cancelledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
        : "Cancelled",
      color: "text-red-500",
    };
  }
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const expected = new Date(order.createdAt);
  expected.setDate(expected.getDate() + 1); expected.setHours(0, 0, 0, 0);
  return {
    text: today >= expected
      ? "Arriving today"
      : `Expected by ${expected.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
    color: "text-secondary",
  };
}

const MyOrders = () => {
  useDocumentTitle("My Orders");
  const { data: orderData, isLoading, error, refetch } = useGetUserOrdersQuery();
  const [page, setPage]                 = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const allOrders = useMemo(
    () => [...(orderData?.order || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orderData?.order]
  );

  const orders = useMemo(
    () => allOrders.filter((o) =>
      statusFilter === "all" ||
      (statusFilter === "active" && (o.orderStatus === "placed" || o.orderStatus === "confirmed")) ||
      o.orderStatus === statusFilter
    ),
    [allOrders, statusFilter]
  );

  const totalPages      = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <Loader className="min-h-[60vh]" message="Loading your orders..." />;
  if (error) return (
    <ErrorState title="Failed to load orders" message="We could not fetch your order history right now." onAction={refetch} />
  );

  return (
    <section className="page-shell">
      <div className="app-shell max-w-2xl space-y-6">

        {/* Page header */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
            Back to home
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-primary">My Orders</h1>
          <p className="mt-0.5 text-sm text-gray-500">Track and manage your purchases</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(s.value); setPage(1); }}
              aria-pressed={statusFilter === s.value}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                statusFilter === s.value
                  ? "bg-secondary text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-500 hover:border-secondary/40 hover:text-secondary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Order list */}
        {orders.length === 0 ? (
          <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 260px)" }}>
          <EmptyState
            title={statusFilter === "all" ? "No orders yet" : `No ${STATUS_FILTERS.find(f => f.value === statusFilter)?.label?.toLowerCase()} yet`}
            message={statusFilter === "all" ? "You haven't placed any orders yet." : "No orders match this filter."}
            actionLabel={statusFilter === "all" ? "Start Shopping" : "View All Orders"}
            actionTo={statusFilter === "all" ? "/order" : undefined}
            onAction={statusFilter !== "all" ? () => setStatusFilter("all") : undefined}
            icon={<PackageOpen className="mx-auto h-16 w-16 text-gray-300" strokeWidth={1.25} aria-hidden />}
            className="py-0"
          />
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const cfg        = getStatusConfig(order.orderStatus);
              const StatusIcon = cfg.icon;
              const delivery   = getDeliveryLine(order);
              const preview    = order.items.slice(0, 3);
              const extra      = order.items.length - 3;

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Top colour accent */}
                  <div className={`h-1 w-full ${cfg.bar}`} />

                  {/* Status row */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${cfg.iconBg}`}>
                        <StatusIcon className={`h-4.5 w-4.5 ${cfg.iconColor}`} strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold ${cfg.labelColor}`}>{cfg.label}</p>
                        <p className={`text-xs font-medium ${delivery.color}`}>{delivery.text}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Order Total</p>
                      <p className="text-lg font-extrabold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                    {preview.map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F5EFE4] p-1.5">
                          <img
                            src={item.image || "https://placehold.co/100"}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty {item.quantity} &times; {formatCurrency(item.price)}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-gray-700">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                    {extra > 0 && (
                      <p className="text-xs font-medium text-gray-400">+{extra} more item{extra > 1 ? "s" : ""}</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-5 py-3">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="hidden sm:flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                        {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <Link
                      to={`/my-orders/${order._id}`}
                      className="flex items-center gap-1 text-xs font-bold text-primary transition hover:text-primary/70"
                    >
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    </Link>
                  </div>
                </div>
              );
            })}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

      </div>
    </section>
  );
};

export default MyOrders;
