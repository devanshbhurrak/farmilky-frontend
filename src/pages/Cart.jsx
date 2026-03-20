import React from "react";
import { useSelector } from "react-redux";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from "../features/api/cartApi";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import CartItem from "../components/CartItem";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Please login to view your cart</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="animate-pulse text-gray-500">Loading your cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500">Failed to load cart</p>
      </div>
    );
  }

  const items = data?.items || [];

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.productId.price,
    0
  );

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
    <section className="bg-[#F9F5F0] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-10">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            <p className="text-gray-600 text-lg">Your cart is empty 🥛</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* CART ITEMS */}
            <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                    <CartItem
                    key={item.productId._id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                    />
                ))}
            </div>

            {/* SUMMARY */}
            <aside className="bg-white p-8 rounded-2xl shadow-md border h-fit sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="flex justify-between mb-3 text-gray-600">
                <span>Total Items</span>
                <span>{items.length}</span>
              </div>

              <div className="flex justify-between mb-6 text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>

              <button
                className="w-full bg-secondary text-white py-3 rounded-xl font-semibold mb-4 hover:bg-secondary/90 transition"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <button
                className="w-full border border-red-500 text-red-500 py-2 rounded-xl hover:bg-red-50 transition"
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
