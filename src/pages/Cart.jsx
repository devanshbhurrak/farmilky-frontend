import React from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from "../features/api/cartApi";

const Cart = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetCartQuery(undefined, {
    skip: !user,
  });

  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();

  if (!user) {
    return (
      <section className="page-shell">
        <div className="app-shell">
          <div className="surface-card mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">
              Your cart is waiting
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Log in to review your cart, update quantities, and continue to
              checkout.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/login"
                state={{ from: { pathname: "/cart" } }}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90"
              >
                Login to Continue
              </Link>
              <Link
                to="/order"
                className="flex min-h-12 items-center justify-center rounded-2xl border border-primary/15 px-6 py-3 font-semibold text-primary transition hover:bg-primary/5"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="animate-pulse text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-red-500">Failed to load cart</p>
      </div>
    );
  }

  const items = data?.items || [];
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.productId.price,
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItem({ productId, quantity }).unwrap();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart({ productId }).unwrap();
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  return (
    <section className="page-shell">
      <div className="app-shell">
        <h1 className="mb-8 text-3xl font-bold text-primary sm:mb-10 sm:text-4xl">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="surface-card p-8 text-center sm:p-10">
            <h2 className="text-2xl font-bold text-primary">Your cart is empty</h2>
            <p className="mt-3 text-lg text-gray-600">
              Add a few fresh essentials and come back when you&apos;re ready to
              checkout.
            </p>
            <Link
              to="/order"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-5 lg:col-span-2 lg:space-y-6">
              {items.map((item) => (
                <CartItem
                  key={item.productId._id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <aside className="surface-card h-fit p-6 lg:sticky lg:top-24 lg:p-8">
              <h2 className="mb-6 text-2xl font-bold">Order Summary</h2>

              <div className="mb-3 flex justify-between text-gray-600">
                <span>Total Items</span>
                <span>{totalQuantity}</span>
              </div>

              <div className="mb-6 flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-primary">Rs. {totalAmount}</span>
              </div>

              <button
                className="mb-4 min-h-12 w-full rounded-xl bg-secondary py-3 font-semibold text-white transition hover:bg-secondary/90"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <button
                className="min-h-11 w-full rounded-xl border border-red-500 py-2 text-red-500 transition hover:bg-red-50"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;
