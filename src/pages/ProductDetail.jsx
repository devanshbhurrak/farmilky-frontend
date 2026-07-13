import React, { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart, Tag, Truck, RefreshCw, ShieldCheck } from "lucide-react";
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
    <div className="app-shell max-w-5xl animate-pulse space-y-8">
      <div className="h-4 w-28 rounded-full bg-gray-200" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="h-80 rounded-3xl bg-gray-200 sm:h-[420px]" />
        <div className="space-y-5 pt-2">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-gray-200" />
            <div className="h-6 w-28 rounded-full bg-gray-200" />
          </div>
          <div className="h-9 w-3/4 rounded-xl bg-gray-200" />
          <div className="h-8 w-1/3 rounded-xl bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-full bg-gray-200" />
            <div className="h-8 w-16 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-4/6 rounded bg-gray-200" />
          </div>
          <div className="mt-4 h-12 w-full rounded-2xl bg-gray-200" />
          <div className="h-11 w-full rounded-2xl bg-gray-200" />
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
      const defVariant = product.variants.find(v => v.isDefault && v.isAvailable)
        || product.variants.find(v => v.isAvailable)
        || product.variants.find(v => v.isDefault)
        || product.variants[0];
      setSelectedVariantId(String(defVariant._id));
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
  const isVariantAvailable = !selectedVariant || selectedVariant.isAvailable !== false;
  const isAvailable = (product?.isAvailable !== false) && isVariantAvailable;

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

  const discountPercent =
    selectedVariant?.discountedPrice != null && selectedVariant.discountedPrice < selectedVariant.price
      ? Math.round((1 - selectedVariant.discountedPrice / selectedVariant.price) * 100)
      : null;

  return (
    <section className="page-shell">
      <div className="app-shell max-w-5xl space-y-8">
        {/* Back link */}
        <Link
          to="/order"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ── Image panel ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8 sm:p-12">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="mx-auto max-h-72 w-full object-contain drop-shadow-xl sm:max-h-[340px]"
            />

            {/* Discount ribbon */}
            {discountPercent && (
              <span className="absolute top-4 left-4 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-white shadow">
                -{discountPercent}% OFF
              </span>
            )}

            {/* Out-of-stock overlay */}
            {!product.isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-[2px]">
                <span className="rounded-full bg-red-100 px-5 py-2 text-sm font-bold uppercase tracking-wide text-red-600 shadow">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="flex flex-col justify-center space-y-5">
            {/* Badges */}
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
                  Subscribable
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-extrabold leading-tight text-primary sm:text-4xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-extrabold text-secondary">
                {formatCurrency(effectivePrice)}
              </span>
              <span className="text-base text-gray-500">/ {displayLabel}</span>
              {discountPercent && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatCurrency(selectedVariant.price)}
                  </span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    Save {formatCurrency(selectedVariant.price - selectedVariant.discountedPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Variant pills */}
            {hasVariants && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Choose Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setSelectedVariantId(String(v._id))}
                      disabled={!v.isAvailable}
                      className={`relative rounded-2xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-200
                        ${
                          String(v._id) === selectedVariantId
                            ? "border-secondary bg-secondary text-white shadow-md"
                            : v.isAvailable
                            ? "border-gray-200 bg-white text-gray-700 hover:border-secondary hover:text-secondary"
                            : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                        }`}
                    >
                      {v.label}
                      {v.discountedPrice != null && v.discountedPrice < v.price && (
                        <span
                          className={`ml-1.5 text-xs font-bold ${
                            String(v._id) === selectedVariantId ? "opacity-90" : "text-secondary"
                          }`}
                        >
                          -{Math.round((1 - v.discountedPrice / v.price) * 100)}%
                        </span>
                      )}
                      {!v.isAvailable && (
                        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
                          OOS
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fat content */}
            {product.fatContent && (
              <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-gray-50 px-3 py-1.5 text-sm">
                <span className="text-gray-500">Fat content:</span>
                <span className="font-semibold text-gray-800">{product.fatContent}</span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="leading-relaxed text-gray-600">{product.description}</p>
            )}

            <div className="my-1 border-t border-gray-100" />

            {/* Cart controls */}
            {!isAvailable ? (
              <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-red-200 bg-red-50 px-5 py-3">
                <span className="font-semibold text-red-500">
                  {!product.isAvailable ? "Currently unavailable" : "This size is out of stock"}
                </span>
              </div>
            ) : quantity === 0 ? (
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-secondary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingCart className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                {adding ? "Adding…" : "Add to Cart"}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-2xl border border-[#E7DED2] bg-[#FBF8F4] px-3 py-1.5 shadow-sm">
                  <button
                    onClick={handleDecrease}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold text-primary transition hover:bg-white hover:shadow-sm"
                    aria-label={`Decrease quantity of ${product.name}`}
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-lg font-bold text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold text-primary transition hover:bg-white hover:shadow-sm"
                    aria-label={`Increase quantity of ${product.name}`}
                  >
                    +
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatCurrency(quantity * effectivePrice)}
                  </p>
                  <p className="text-xs text-gray-400">in cart</p>
                </div>
              </div>
            )}

            {/* Subscribe CTA */}
            {isSubscriptionFriendly && isAvailable && (
              <Link
                to={`/subscribe?productId=${product._id}&quantity=${Math.max(quantity, 1)}${
                  selectedVariantId ? `&variantId=${selectedVariantId}` : ""
                }`}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary/20 px-5 py-2.5 font-semibold text-primary transition hover:bg-primary/5"
              >
                <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                Subscribe for Daily Delivery
              </Link>
            )}

            {quantity > 0 && (
              <Link to="/cart" className="text-sm font-semibold text-secondary hover:underline">
                View Cart →
              </Link>
            )}

            {/* Trust signals */}
            <div className="mt-2 grid grid-cols-3 gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              {[
                { icon: Truck, label: "Fresh Delivery" },
                { icon: ShieldCheck, label: "Quality Assured" },
                { icon: RefreshCw, label: "Easy Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="h-5 w-5 text-secondary" strokeWidth={1.75} aria-hidden />
                  <span className="text-[11px] font-semibold text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default ProductDetail;
