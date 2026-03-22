import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from "../features/api/cartApi";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Product = ({ product }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: cart } = useGetCartQuery(undefined, {
    skip: !user,
  });

  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const isSubscriptionFriendly = product.category === "milk";

  const cartItem = cart?.items?.find((item) => item.productId._id === product._id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = async () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        _product: product,
      }).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add");
    }
  };

  const handleIncrease = async () => {
    await updateCartItem({
      productId: product._id,
      quantity: quantity + 1,
    });
  };

  const handleDecrease = async () => {
    if (quantity === 1) {
      await removeFromCart({ productId: product._id });
      return;
    }

    await updateCartItem({
      productId: product._id,
      quantity: quantity - 1,
    });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-lg transition hover:shadow-2xl">
      <img
        src={product.image}
        alt={product.name}
        className="h-56 w-full bg-white object-contain p-4 sm:h-64"
      />

      <div className="flex grow flex-col p-5 sm:p-6">
        {isSubscriptionFriendly && (
          <span className="mb-3 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Best for Subscription
          </span>
        )}

        <h3 className="text-xl font-bold text-primary sm:text-2xl">
          {product.name}
        </h3>

        <p className="mt-2 text-xl font-semibold text-secondary">
          Rs. {product.price}{" "}
          <span className="text-base text-gray-600">{product.unit}</span>
        </p>

        <p className="mt-2 text-sm text-gray-500">
          {isSubscriptionFriendly
            ? "Choose one-time order or set up a regular delivery plan."
            : "Great for add-on orders and dairy essentials."}
        </p>

        <div className="mt-6">
          {quantity === 0 ? (
            <button
              disabled={adding}
              onClick={handleAdd}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaShoppingCart />
              Add to Cart
            </button>
          ) : (
            <div className="flex w-full items-center justify-between rounded-2xl border border-[#E7DED2] bg-[#F7F3ED] px-4 py-2">
              <button
                onClick={handleDecrease}
                className="h-10 w-10 rounded-full bg-white text-xl text-primary transition hover:bg-gray-100"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                -
              </button>

              <span className="text-lg font-semibold text-primary">{quantity}</span>

              <button
                onClick={handleIncrease}
                className="h-10 w-10 rounded-full bg-white text-xl text-primary transition hover:bg-gray-100"
                aria-label={`Increase quantity of ${product.name}`}
              >
                +
              </button>
            </div>
          )}
        </div>

        {isSubscriptionFriendly && (
          <Link
            to={`/subscribe?productId=${product._id}`}
            className="mt-3 flex min-h-11 items-center justify-center rounded-2xl border border-primary/15 px-5 py-2 font-semibold text-primary transition hover:bg-primary/5"
          >
            Subscribe Instead
          </Link>
        )}
      </div>
    </div>
  );
};

export default Product;
