import React from "react";
import toast from "react-hot-toast";
import { CircleCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/ErrorState";
import Loader from "../components/Loader";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAddToCartMutation } from "../features/api/cartApi";
import { useGetOrderByIdQuery } from "../features/api/orderApi";

const OrderSuccess = () => {
  useDocumentTitle("Order Placed")
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetOrderByIdQuery(id);
  const [addToCart, { isLoading: isReordering }] = useAddToCartMutation();
  const order = data?.order;
  const handleOrderAgain = async () => {
    if (!order?.items?.length) return;

    try {
      await Promise.all(
        order.items.map((item) =>
          addToCart({
            productId: item.productId?._id || item.productId,
            quantity: item.quantity,
          }).unwrap()
        )
      );
      toast.success("Items added back to cart");
      navigate("/cart");
    } catch {
      toast.error("We could not add every item back to cart");
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-[80vh] bg-background py-16">
        <Loader message="Loading your order details..." />
      </section>
    );
  }

  if (error) {
    return (
      <div>
        <ErrorState
          title="Order received"
          message={`We could not load the order details right now, but your order ID is ${id}.`}
          onAction={() => window.location.reload()}
          actionLabel="Retry"
          className="min-h-[80vh] py-16"
        />
      </div>
    );
  }

  const expectedDelivery = order?.createdAt
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
    <section className="flex min-h-[80vh] items-center justify-center bg-background py-16">
      <div className="surface-card mx-4 w-full max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CircleCheck className="mx-auto h-16 w-16 text-green-500" strokeWidth={1.5} aria-hidden />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-primary">Order Placed!</h1>
        <p className="mb-8 text-gray-600">
          Thank you for your order. We&apos;ll start processing it right away.
        </p>

        <div className="mb-8 space-y-3 rounded-xl bg-gray-50 p-4 text-left">
          <div>
            <p className="mb-1 text-sm text-gray-500">Order ID</p>
            <p className="break-all font-mono font-medium text-gray-800">{id}</p>
          </div>

          {expectedDelivery && (
            <div>
              <p className="mb-1 text-sm text-gray-500">Expected Delivery</p>
              <p className="font-semibold text-secondary">
                {today >= expectedDelivery
                  ? "Arriving today"
                  : expectedDelivery.toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </p>
            </div>
          )}

          {order?.address?.street && (
            <div>
              <p className="mb-1 text-sm text-gray-500">Delivery Address</p>
              <p className="text-sm text-gray-700">
                {order.address.street}, {order.address.city}, {order.address.state}{" "}
                {order.address.pincode}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-primary/15 bg-primary/5 p-4 text-left">
          <p className="text-sm font-semibold text-primary">What&apos;s next?</p>
          <p className="mt-1 text-sm text-gray-600">
            Need milk daily? Set up a subscription for automatic doorstep delivery and never run out.
          </p>
          <Link to="/order" className="mt-2 inline-flex text-sm font-semibold text-secondary hover:underline">
            Browse subscription-friendly products →
          </Link>
        </div>

        <div className="space-y-3">
          <Link
            to={`/my-orders/${id}`}
            className="block w-full rounded-2xl bg-secondary py-3 font-semibold text-white transition hover:bg-secondary/90"
          >
            Track This Order
          </Link>
          <button
            onClick={handleOrderAgain}
            disabled={isReordering}
            className="block w-full rounded-2xl bg-primary py-3 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isReordering ? "Adding Items..." : "Order Again"}
          </button>
          <Link
            to="/order"
            className="block w-full rounded-2xl border border-gray-300 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
