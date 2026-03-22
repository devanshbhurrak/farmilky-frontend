import { useState } from "react";
import Product from "../components/Product";
import { useGetAllProductsQuery } from "../features/api/productApi";

const filters = ["All", "Milk", "Dairy"];

const OrderNowPage = () => {
  const [filter, setFilter] = useState("All");
  const { data, isLoading } = useGetAllProductsQuery();
  const products = data?.products || [];
  const milkCount = products.filter((product) => product.category === "milk").length;
  const dairyCount = products.filter((product) =>
    ["paneer", "ghee", "curd", "butter", "cheese"].includes(product.category)
  ).length;

  const filteredProducts = products.filter((product) => {
    if (filter === "All") return true;
    if (filter === "Milk") return product.category === "milk";
    if (filter === "Dairy") {
      return ["paneer", "ghee", "curd", "butter", "cheese"].includes(product.category);
    }
    return true;
  });

  return (
    <>
      <section className="page-hero">
        <div className="app-shell text-center">
          <p className="page-kicker">Shop Now</p>
          <h1 className="page-title mt-2">
            Our Fresh Products
          </h1>
          <p className="page-copy mx-auto mt-6">
            Browse our selection of farm-fresh milk and dairy products, ready
            for delivery.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 md:py-24">
        <div className="app-shell">

          <div className="mb-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            {filters.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`min-h-11 rounded-2xl px-5 py-2 font-semibold transition-colors sm:px-6 ${
                  filter === option
                    ? "bg-secondary text-white"
                    : "bg-gray-200 text-primary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {isLoading
              ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
              : filteredProducts.map((product) => (
                  <Product key={product._id} product={product} />
                ))}
          </div>

          {!isLoading && filteredProducts.length === 0 && (
            <div className="surface-panel mt-10 p-8 text-center text-gray-600">
              <p className="text-lg font-semibold text-primary">
                No products matched this category
              </p>
              <p className="mt-2">
                Try switching back to `All` to browse everything currently available.
              </p>
              <button
                onClick={() => setFilter("All")}
                className="mt-5 rounded-2xl bg-secondary px-5 py-2 font-semibold text-white transition hover:bg-secondary/90"
              >
                Show All Products
              </button>
            </div>
          )}

          <div className="my-10 rounded-[2rem] border border-primary/10 bg-[#FCFAF7] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
                  Shop by Need
                </p>
                <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
                  Pick a one-time order or start with milk for regular delivery
                </h2>
                <p className="mt-3 text-gray-600">
                  Use `Milk` when you want products that also work well as subscriptions.
                  Use `Dairy` for add-ons like paneer, curd, butter, and ghee.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Milk Options
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary">{milkCount}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Dairy Add-ons
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary">{dairyCount}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        
      </section>
    </>
  );
};

const ProductSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-md animate-pulse">
      <div className="h-48 bg-gray-300" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-300" />
        <div className="h-4 w-1/2 rounded bg-gray-300" />
        <div className="mt-4 h-10 rounded bg-gray-300" />
      </div>
    </div>
  );
};

export default OrderNowPage;
