import React from "react";

const ProductSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md animate-pulse">
    {/* Image area */}
    <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 sm:h-60" />

    {/* Content */}
    <div className="flex flex-col gap-3 px-5 py-4 sm:px-6 sm:py-5">
      {/* Name */}
      <div className="h-5 w-3/4 rounded-lg bg-gray-200" />
      {/* Price */}
      <div className="flex items-baseline gap-2">
        <div className="h-7 w-24 rounded-lg bg-gray-200" />
        <div className="h-4 w-12 rounded bg-gray-100" />
      </div>
      {/* Variant pills */}
      <div className="flex gap-2">
        <div className="h-8 w-14 rounded-full bg-gray-200" />
        <div className="h-8 w-14 rounded-full bg-gray-100" />
      </div>
      {/* Description */}
      <div className="h-3 w-4/5 rounded bg-gray-100" />
      {/* CTA */}
      <div className="mt-1 h-11 w-full rounded-2xl bg-gray-200" />
    </div>
  </div>
);

export default ProductSkeleton;
