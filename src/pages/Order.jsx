import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, Search } from "lucide-react";
import Product from "../components/Product";
import ProductSkeleton from "../components/ProductSkeleton";
import ErrorState from "../components/ErrorState";
import { useGetAllProductsQuery } from "../features/api/productApi";
import useDocumentTitle from "../hooks/useDocumentTitle";

const filters = ["All", "Milk", "Dairy"];
const DAIRY_CATEGORIES = ["paneer", "ghee", "curd", "butter", "cheese"];
const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
];

const OrderNowPage = () => {
  useDocumentTitle("Our Products")
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const { data, isLoading, error, refetch } = useGetAllProductsQuery();
  const products = data?.products || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { milkCount, dairyCount, filteredProducts } = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    let milk = 0;
    let dairy = 0;
    const filtered = products.filter((product) => {
      if (product.category === "milk") milk++;
      else if (DAIRY_CATEGORIES.includes(product.category)) dairy++;

      const matchesCategory =
        filter === "All" ||
        (filter === "Milk" && product.category === "milk") ||
        (filter === "Dairy" && DAIRY_CATEGORIES.includes(product.category));
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));

    return { milkCount: milk, dairyCount: dairy, filteredProducts: filtered };
  }, [products, filter, search, sort]);

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

          <div className="mx-auto mb-6 w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            {filters.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
                className={`min-h-11 rounded-2xl px-5 py-2 font-semibold transition-all duration-200 sm:px-6 ${
                  filter === option
                    ? "bg-secondary text-white shadow-sm"
                    : "bg-gray-200 text-primary hover:bg-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-6">
              <ErrorState
                message="Failed to load products. Please try again."
                onAction={refetch}
              />
            </div>
          ) : (
          <>
          <div className="mb-4 flex items-center justify-between gap-3">
            {!isLoading && filteredProducts.length > 0 ? (
              <p className="text-sm text-gray-500" aria-live="polite">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                {search.trim() ? <> for &ldquo;<strong>{search.trim()}</strong>&rdquo;</> : null}
              </p>
            ) : <span />}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-primary"
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
              >
                <ArrowDownUp className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                <span className="font-medium">{SORT_OPTIONS.find(o => o.value === sort)?.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} strokeWidth={2} aria-hidden />
              </button>
              {sortOpen && (
                <ul
                  role="listbox"
                  aria-label="Sort options"
                  className="absolute right-0 top-full z-20 mt-1.5 min-w-[180px] overflow-hidden rounded-2xl border border-gray-100 bg-white py-1.5 shadow-lg shadow-black/8 animate-[fadeSlideDown_150ms_ease-out]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={sort === opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition ${
                        sort === opt.value
                          ? "bg-secondary/5 font-semibold text-secondary"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      {opt.label}
                      {sort === opt.value && <Check className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2.5} aria-hidden />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {isLoading
              ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
              : filteredProducts.map((product) => (
                  <Product key={product._id} product={product} />
                ))}
          </div>
          </>
          )}

          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="surface-panel mt-10 p-8 text-center text-gray-600">
              <p className="text-lg font-semibold text-primary">No products found</p>
              <p className="mt-2">
                {search.trim()
                  ? <>No results for "<strong>{search}</strong>". Try a different keyword or clear the search.</>
                  : <>Try switching back to <strong>All</strong> to browse everything currently available.</>
                }
              </p>
              <button
                onClick={() => { setFilter("All"); setSearch(""); }}
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
                  Use <strong>Milk</strong> when you want products that also work well as subscriptions.
                  Use <strong>Dairy</strong> for add-ons like paneer, curd, butter, and ghee.
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

export default OrderNowPage;
