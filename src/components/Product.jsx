import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from "../features/api/cartApi";
import { useSelector } from "react-redux";

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

  const hasVariants = product.variants?.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    if (hasVariants) {
      const def = product.variants.find(v => v.isDefault) || product.variants[0];
      setSelectedVariantId(String(def._id));
    } else {
      setSelectedVariantId(null);
    }
  }, [product._id, hasVariants]);

  const selectedVariant = (hasVariants && selectedVariantId)
    ? (product.variants.find(v => String(v._id) === selectedVariantId) ?? null)
    : null;
  const effectivePrice = selectedVariant
    ? (selectedVariant.discountedPrice ?? selectedVariant.price)
    : product.price;
  const displayLabel = selectedVariant ? selectedVariant.label : product.unit;

  const cartItem = cart?.items?.find(
    (item) =>
      String(item.productId?._id || item.productId) === String(product._id) &&
      String(item.variantId ?? null) === String(selectedVariantId ?? null)
  );
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
        variantId: selectedVariantId,
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
      variantId: selectedVariantId,
    });
  };

  const handleDecrease = async () => {
    if (quantity === 1) {
      await removeFromCart({ productId: product._id, variantId: selectedVariantId });
      return;
    }

    await updateCartItem({
      productId: product._id,
      quantity: quantity - 1,
      variantId: selectedVariantId,
    });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-lg transition hover:shadow-2xl hover:-translate-y-1 duration-300">
      <Link to={`/product/${product._id}`} tabIndex={-1} aria-hidden>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-56 w-full bg-white object-contain p-4 sm:h-64"
        />
      </Link>

      <div className="flex grow flex-col p-5 sm:p-6">
        {isSubscriptionFriendly && (
          <span className="mb-3 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Best for Subscription
          </span>
        )}

        <Link to={`/product/${product._id}`}>
          <h3 className="text-xl font-bold text-primary transition hover:text-secondary sm:text-2xl">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-xl font-semibold text-secondary">
          {formatCurrency(effectivePrice)}{" "}
          <span className="text-base text-gray-600">{displayLabel}</span>
          {selectedVariant?.discountedPrice != null && selectedVariant.discountedPrice < selectedVariant.price && (
            <span className="text-xs text-gray-400 line-through ml-1">
              {formatCurrency(selectedVariant.price)}
            </span>
          )}
        </p>

        {hasVariants && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.variants.map(v => (
              <button
                key={v._id}
                type="button"
                onClick={() => setSelectedVariantId(String(v._id))}
                disabled={!v.isAvailable}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition
                  ${String(v._id) === selectedVariantId
                    ? 'border-secondary bg-secondary text-white'
                    : v.isAvailable
                      ? 'border-gray-300 text-gray-700 hover:border-secondary'
                      : 'cursor-not-allowed border-gray-200 text-gray-300'
                  }`}
              >
                {v.label}
                {v.discountedPrice != null && v.discountedPrice < v.price && (
                  <span className="ml-1 opacity-80">{Math.round((1 - v.discountedPrice / v.price) * 100)}%</span>
                )}
              </button>
            ))}
          </div>
        )}

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
              <ShoppingCart className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
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
            to={`/subscribe?productId=${product._id}&quantity=${Math.max(quantity, 1)}${selectedVariantId ? `&variantId=${selectedVariantId}` : ''}`}
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
