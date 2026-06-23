import React from "react";

const ProductSkeleton = () => (
  <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-md animate-pulse">
    <div className="h-56 bg-gray-300 sm:h-64" />
    <div className="space-y-3 p-5 sm:p-6">
      <div className="h-4 w-3/4 rounded bg-gray-300" />
      <div className="h-4 w-1/2 rounded bg-gray-300" />
      <div className="mt-4 h-10 rounded-2xl bg-gray-300" />
    </div>
  </div>
);

export default ProductSkeleton;
