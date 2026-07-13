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
  const [imgLoaded, setImgLoaded] = useState(false);

  const isProductAvailable = product.isAvailable !== false;

  useEffect(() => {
    if (hasVariants) {
      const defVariant = product.variants.find(v => v.isDefault && v.isAvailable)
        || product.variants.find(v => v.isAvailable)
        || product.variants.find(v => v.isDefault)
        || product.variants[0];
      setSelectedVariantId(String(defVariant._id));
    } else {
      setSelectedVariantId(null);
    }
  }, [product._id, hasVariants]);

  const selectedVariant = (hasVariants && selectedVariantId)
    ? (product.variants.find(v => String(v._id) === selectedVariantId) ?? null)
    : null;
  const isVariantAvailable = !selectedVariant || selectedVariant.isAvailable !== false;
  const isAvailable = isProductAvailable && isVariantAvailable;
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
      toast.error(err?.data?.message || "Failed to add to cart. Please try again.");
    }
  };

  const handleIncrease = async () => {
    try {
      await updateCartItem({
        productId: product._id,
        quantity: quantity + 1,
        variantId: selectedVariantId,
      }).unwrap();
    } catch {
      toast.error("Couldn't update quantity. Please try again.");
    }
  };

  const handleDecrease = async () => {
    try {
      if (quantity === 1) {
        await removeFromCart({ productId: product._id, variantId: selectedVariantId }).unwrap();
        return;
      }
      await updateCartItem({
        productId: product._id,
        quantity: quantity - 1,
        variantId: selectedVariantId,
      }).unwrap();
    } catch {
      toast.error("Couldn't update quantity. Please try again.");
    }
  };

  const discountPercent =
    selectedVariant?.discountedPrice != null && selectedVariant.discountedPrice < selectedVariant.price
      ? Math.round((1 - selectedVariant.discountedPrice / selectedVariant.price) * 100)
      : null;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        !isProductAvailable ? "opacity-70" : ""
      }`}
    >
      {/* Image area */}
      <Link to={`/product/${product._id}`} tabIndex={-1} aria-hidden className="relative block">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`h-52 w-full object-contain p-5 sm:h-60 transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Discount badge */}
          {discountPercent && (
            <span className="absolute top-3 left-3 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}

          {/* Subscription badge */}
          {isSubscriptionFriendly && (
            <span className="absolute top-3 right-3 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              Subscribable
            </span>
          )}

          {/* Out of stock overlay */}
          {!isProductAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-[2px]">
              <span className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-red-600 shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex grow flex-col px-5 py-4 sm:px-6 sm:py-5">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-bold leading-snug text-primary transition-colors hover:text-secondary sm:text-xl">
            {product.name}
          </h3>
        </Link>

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-secondary sm:text-2xl">
            {formatCurrency(effectivePrice)}
          </span>
          <span className="text-sm text-gray-500">{displayLabel}</span>
          {discountPercent && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(selectedVariant.price)}
            </span>
          )}
        </div>

        {/* Variant selector */}
        {hasVariants && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variants.map((v) => (
              <button
                key={v._id}
                type="button"
                onClick={() => setSelectedVariantId(String(v._id))}
                disabled={!v.isAvailable}
                className={`min-h-[32px] rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200
                  ${
                    String(v._id) === selectedVariantId
                      ? "border-secondary bg-secondary text-white shadow-sm"
                      : v.isAvailable
                      ? "border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary"
                      : "cursor-not-allowed border-gray-100 text-gray-300"
                  }`}
              >
                {v.label}
                {v.discountedPrice != null && v.discountedPrice < v.price && (
                  <span className="ml-1 font-bold opacity-90">
                    -{Math.round((1 - v.discountedPrice / v.price) * 100)}%
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <p className="mt-2.5 text-xs leading-relaxed text-gray-400">
          {isSubscriptionFriendly
            ? "One-time or recurring delivery — your choice."
            : "Perfect for daily dairy add-ons."}
        </p>

        {/* CTA */}
        <div className="mt-auto pt-4">
          {!isAvailable ? (
            <div className="flex min-h-11 w-full items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50">
              <span className="text-sm font-semibold text-red-500">
                {!isProductAvailable ? "Currently Unavailable" : "Size out of stock"}
              </span>
            </div>
          ) : quantity === 0 ? (
            <button
              disabled={adding}
              onClick={handleAdd}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-secondary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Add to Cart
            </button>
          ) : (
            <div className="flex w-full items-center justify-between rounded-2xl border border-[#E7DED2] bg-[#FBF8F4] px-3 py-1.5">
              <button
                onClick={handleDecrease}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-primary shadow-sm transition hover:bg-gray-50"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                −
              </button>
              <span className="min-w-[1.5rem] text-center text-base font-bold text-primary">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-primary shadow-sm transition hover:bg-gray-50"
                aria-label={`Increase quantity of ${product.name}`}
              >
                +
              </button>
            </div>
          )}

          {isSubscriptionFriendly && isAvailable && (
            <Link
              to={`/subscribe?productId=${product._id}&quantity=${Math.max(quantity, 1)}${
                selectedVariantId ? `&variantId=${selectedVariantId}` : ""
              }`}
              className="mt-2.5 flex min-h-10 items-center justify-center rounded-2xl border border-primary/20 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Subscribe Instead
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
