import React from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import ErrorState from "../components/ErrorState";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from "../features/api/cartApi";

const Cart = () => {
  useDocumentTitle("Cart")
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
            <h1 className="hidden text-2xl font-bold text-primary md:block md:text-3xl">
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
      <section className="page-shell">
        <div className="app-shell">
          <div className="mb-6 hidden h-8 w-48 animate-pulse rounded-xl bg-gray-200 md:block" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-5 lg:col-span-2">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-[28px] border border-gray-200 bg-gray-50 p-5 sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
                    <div className="h-32 w-full flex-shrink-0 rounded-2xl bg-gray-200 sm:h-36 sm:w-36" />
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="h-5 w-2/3 rounded-lg bg-gray-200" />
                      <div className="h-4 w-1/3 rounded-lg bg-gray-200" />
                      <div className="mt-3 h-10 w-36 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="surface-card h-fit animate-pulse space-y-4 p-6 lg:p-8">
              <div className="h-6 w-36 rounded-lg bg-gray-200" />
              <div className="h-4 w-full rounded-lg bg-gray-200" />
              <div className="h-4 w-3/4 rounded-lg bg-gray-200" />
              <div className="mt-4 h-12 w-full rounded-xl bg-gray-200" />
              <div className="h-10 w-full rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-shell">
        <div className="app-shell">
          <ErrorState title="Failed to load cart" message="We couldn't load your cart right now. Please try again." />
        </div>
      </section>
    );
  }

  const items = data?.items || [];
  const totalAmount = items.reduce((sum, item) => {
    const variant = item.variantId && item.productId?.variants?.length > 0
      ? item.productId.variants.find(v => String(v._id) === String(item.variantId))
      : null;
    const price = variant ? (variant.discountedPrice ?? variant.price) : item.productId?.price ?? 0;
    return sum + item.quantity * price;
  }, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = async (productId, quantity, variantId) => {
    if (quantity < 1) return;
    try {
      await updateCartItem({ productId, quantity, variantId }).unwrap();
    } catch {
      toast.error("Couldn't update quantity. Please try again.");
    }
  };

  const handleRemove = async (productId, variantId) => {
    try {
      await removeFromCart({ productId, variantId }).unwrap();
      toast.success("Item removed");
    } catch {
      toast.error("Couldn't remove item. Please try again.");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Remove all items from your cart?")) return;
    try {
      await clearCart().unwrap();
      toast.success("Cart cleared");
    } catch {
      toast.error("Couldn't clear cart. Please try again.");
    }
  };

  return (
    <section className="page-shell">
      <div className="app-shell">
        <h1 className="mb-6 text-2xl font-bold text-primary sm:mb-8 sm:text-3xl">
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
          <>
          <div className="grid grid-cols-1 gap-8 pb-24 lg:grid-cols-3 lg:gap-10 lg:pb-0">
            <div className="space-y-5 lg:col-span-2 lg:space-y-6">
              {items.map((item) => (
                <CartItem
                  key={`${item.productId._id}-${item.variantId ?? 'base'}`}
                  item={item}
                  variantId={item.variantId}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <aside className="hidden lg:block surface-card h-fit p-6 lg:sticky lg:top-24 lg:p-8">
              <h2 className="mb-6 text-2xl font-bold">Order Summary</h2>

              <div className="mb-3 flex justify-between text-gray-600">
                <span>Total Items</span>
                <span>{totalQuantity}</span>
              </div>

              <div className="mb-6 flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>

              <button
                className="mb-4 min-h-12 w-full rounded-2xl bg-secondary py-3 font-semibold text-white transition hover:bg-secondary/90"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <button
                className="min-h-11 w-full rounded-2xl border border-red-500 py-2 text-red-500 transition hover:bg-red-50"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
            </aside>
          </div>

          {/* Sticky mobile checkout bar */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 pt-3 safe-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">{totalQuantity} item{totalQuantity !== 1 ? "s" : ""}</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(totalAmount)}</p>
              </div>
              <button
                className="min-h-12 flex-1 rounded-2xl bg-secondary py-3 font-semibold text-white transition hover:bg-secondary/90"
                onClick={() => navigate("/checkout")}
              >
                Checkout
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Cart;
