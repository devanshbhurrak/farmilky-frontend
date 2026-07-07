import React, { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetProductByIdQuery } from "../features/api/productApi";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from "../features/api/cartApi";

// Maps category slugs to readable labels
const CATEGORY_LABELS = {
  milk: "Milk",
  ghee: "Ghee",
  paneer: "Paneer",
  curd: "Curd",
  butter: "Butter",
  cheese: "Cheese",
  other: "Other",
};

const CATEGORY_COLORS = {
  milk: "bg-blue-50 text-blue-700",
  ghee: "bg-amber-50 text-amber-700",
  paneer: "bg-orange-50 text-orange-700",
  curd: "bg-yellow-50 text-yellow-700",
  butter: "bg-lime-50 text-lime-700",
  cheese: "bg-emerald-50 text-emerald-700",
  other: "bg-gray-100 text-gray-600",
};

const ProductDetailSkeleton = () => (
  <section className="page-shell">
    <div className="app-shell max-w-5xl animate-pulse space-y-6">
      <div className="h-4 w-32 rounded-lg bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="h-80 rounded-3xl bg-gray-200 sm:h-96" />
        <div className="space-y-4">
          <div className="h-5 w-24 rounded-full bg-gray-200" />
          <div className="h-8 w-3/4 rounded-lg bg-gray-200" />
          <div className="h-6 w-1/3 rounded-lg bg-gray-200" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-4/6 rounded bg-gray-200" />
          </div>
          <div className="mt-6 h-12 w-full rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  </section>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const { data: product, isLoading, error } = useGetProductByIdQuery(id);

  useDocumentTitle(product?.name ?? "Product");

  const { data: cart } = useGetCartQuery(undefined, { skip: !user });
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  const hasVariants = product?.variants?.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    if (hasVariants) {
      const def = product.variants.find(v => v.isDefault) || product.variants[0];
      setSelectedVariantId(String(def._id));
    } else {
      setSelectedVariantId(null);
    }
  }, [product?._id, hasVariants]);

  const selectedVariant = (hasVariants && selectedVariantId)
    ? (product.variants.find(v => String(v._id) === selectedVariantId) ?? null)
    : null;
  const effectivePrice = selectedVariant
    ? (selectedVariant.discountedPrice ?? selectedVariant.price)
    : product?.price ?? 0;
  const displayLabel = selectedVariant ? selectedVariant.label : product?.unit;

  const cartItem = cart?.items?.find(
    (item) =>
      String(item.productId?._id || item.productId) === String(id) &&
      String(item.variantId ?? null) === String(selectedVariantId ?? null)
  );
  const quantity = cartItem?.quantity ?? 0;

  const isSubscriptionFriendly = product?.category === "milk";

  const handleAdd = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    try {
      await addToCart({ productId: id, quantity: 1, variantId: selectedVariantId, _product: product }).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add to cart");
    }
  };

  const handleIncrease = async () => {
    try {
      await updateCartItem({ productId: id, quantity: quantity + 1, variantId: selectedVariantId }).unwrap();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleDecrease = async () => {
    try {
      if (quantity === 1) {
        await removeFromCart({ productId: id, variantId: selectedVariantId }).unwrap();
      } else {
        await updateCartItem({ productId: id, quantity: quantity - 1, variantId: selectedVariantId }).unwrap();
      }
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <div className="surface-card max-w-md p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-primary">Product not found</h1>
          <p className="mb-6 text-gray-600">
            This product may no longer be available.
          </p>
          <Link
            to="/order"
            className="inline-flex rounded-xl bg-secondary px-6 py-3 font-semibold text-white"
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="app-shell max-w-5xl space-y-6">
        <Link
          to="/order"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product image */}
          <div className="surface-card flex items-center justify-center rounded-3xl p-8 sm:p-12">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="max-h-72 w-full object-contain drop-shadow-lg sm:max-h-80"
            />
          </div>

          {/* Product info */}
          <div className="flex flex-col justify-center space-y-5">
            {/* Category + availability */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.other
                }`}
              >
                <Tag className="h-3 w-3" aria-hidden />
                {CATEGORY_LABELS[product.category] ?? product.category}
              </span>
              {isSubscriptionFriendly && (
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                  Best for Subscription
                </span>
              )}
              {!product.isAvailable && (
                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-600">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold text-secondary">
                {formatCurrency(effectivePrice)}
              </span>
              <span className="text-base text-gray-500">/ {displayLabel}</span>
              {selectedVariant?.discountedPrice != null && selectedVariant.discountedPrice < selectedVariant.price && (
                <span className="text-base text-gray-400 line-through">
                  {formatCurrency(selectedVariant.price)}
                </span>
              )}
            </div>

            {/* Variant selector */}
            {hasVariants && (
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => setSelectedVariantId(String(v._id))}
                    disabled={!v.isAvailable}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition
                      ${String(v._id) === selectedVariantId
                        ? 'border-secondary bg-secondary text-white'
                        : v.isAvailable
                          ? 'border-gray-300 text-gray-700 hover:border-secondary'
                          : 'cursor-not-allowed border-gray-200 text-gray-300'
                      }`}
                  >
                    {v.label}
                    {v.discountedPrice != null && v.discountedPrice < v.price && (
                      <span className="ml-1 opacity-80">{Math.round((1 - v.discountedPrice / v.price) * 100)}% off</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {product.fatContent && (
              <p className="text-sm text-gray-500">
                Fat content: <span className="font-medium text-gray-700">{product.fatContent}</span>
              </p>
            )}

            {product.description && (
              <p className="leading-relaxed text-gray-600">{product.description}</p>
            )}

            {/* Cart controls */}
            <div className="pt-2">
              {!product.isAvailable ? (
                <p className="font-semibold text-red-500">Currently unavailable</p>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-48"
                >
                  <ShoppingCart className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  {adding ? "Adding..." : "Add to Cart"}
                </button>
              ) : (
                <div className="flex w-full items-center gap-4 sm:w-auto">
                  <div className="flex items-center rounded-2xl border border-[#E7DED2] bg-[#F7F3ED] px-3 py-2">
                    <button
                      onClick={handleDecrease}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-primary transition hover:bg-white"
                      aria-label={`Decrease quantity of ${product.name}`}
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-lg font-semibold text-primary">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-primary transition hover:bg-white"
                      aria-label={`Increase quantity of ${product.name}`}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(quantity * effectivePrice)} in cart
                  </p>
                </div>
              )}
            </div>

            {isSubscriptionFriendly && (
              <Link
                to={`/subscribe?productId=${product._id}&quantity=${Math.max(quantity, 1)}${selectedVariantId ? `&variantId=${selectedVariantId}` : ''}`}
                className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-primary/15 px-5 py-2.5 font-semibold text-primary transition hover:bg-primary/5 sm:w-auto"
              >
                Subscribe for Daily Delivery
              </Link>
            )}

            <Link
              to="/cart"
              className="text-sm font-medium text-secondary hover:underline"
            >
              View Cart →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
