import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, Search, X, Milk, Package } from "lucide-react";
import Product from "../components/Product";
import ProductSkeleton from "../components/ProductSkeleton";
import ErrorState from "../components/ErrorState";
import { useGetAllProductsQuery } from "../features/api/productApi";
import useDocumentTitle from "../hooks/useDocumentTitle";

const DAIRY_CATEGORIES = ["paneer", "ghee", "curd", "butter", "cheese"];
const SORT_OPTIONS = [
  { value: "default",    label: "Default" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc",   label: "Name: A → Z" },
];

const OrderNowPage = () => {
  useDocumentTitle("Our Products");
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [sort, setSort]       = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef  = useRef(null);
  const searchRef = useRef(null);

  const { data, isLoading, error, refetch } = useGetAllProductsQuery();
  const products = data?.products || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { milkCount, dairyCount, allCount, filteredProducts } = useMemo(() => {
    const term = search.trim().toLowerCase();
    let milk = 0, dairy = 0;

    products.forEach((p) => {
      if (p.category === "milk") milk++;
      else if (DAIRY_CATEGORIES.includes(p.category)) dairy++;
    });

    const filtered = products.filter((p) => {
      const matchCat =
        filter === "All" ||
        (filter === "Milk"  && p.category === "milk") ||
        (filter === "Dairy" && DAIRY_CATEGORIES.includes(p.category));
      const matchSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });

    if (sort === "price-asc")  filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    if (sort === "name-asc")   filtered.sort((a, b) => a.name.localeCompare(b.name));

    return { milkCount: milk, dairyCount: dairy, allCount: products.length, filteredProducts: filtered };
  }, [products, filter, search, sort]);

  const filters = [
    { key: "All",   label: "All Products", count: allCount },
    { key: "Milk",  label: "Milk",         count: milkCount },
    { key: "Dairy", label: "Dairy",        count: dairyCount },
  ];

  const activeSort = SORT_OPTIONS.find((o) => o.value === sort);
  const hasSearch  = search.trim().length > 0;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FDFAF6] via-[#FBF6EE] to-[#F5EFE4] py-8 sm:py-14">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-primary/8 blur-3xl" aria-hidden />

        <div className="app-shell relative text-center">
          <span className="page-kicker">Shop Now</span>
          <h1 className="page-title mt-2">Our Fresh Products</h1>
          <p className="page-copy mx-auto mt-4 max-w-xl">
            Farm-fresh milk and dairy — delivered straight to your door.
          </p>

          {/* Search bar inside hero */}
          <div className="mx-auto mt-10 w-full max-w-lg">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm shadow-md transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
              {hasSearch && (
                <button
                  onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Products section ── */}
      <section className="bg-white py-8 md:py-12">
        <div className="app-shell">

          {/* Filter tabs */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1 sm:justify-center sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {filters.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  filter === key
                    ? "bg-secondary text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error ? (
            <ErrorState message="Failed to load products. Please try again." onAction={refetch} />
          ) : (
            <>
              {/* Results bar */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500" aria-live="polite">
                  {isLoading ? (
                    <span className="inline-block h-4 w-32 animate-pulse rounded bg-gray-200" />
                  ) : filteredProducts.length > 0 ? (
                    <>
                      <span className="font-semibold text-gray-700">{filteredProducts.length}</span>{" "}
                      product{filteredProducts.length !== 1 ? "s" : ""}
                      {hasSearch && (
                        <> for &ldquo;<strong className="text-primary">{search.trim()}</strong>&rdquo;</>
                      )}
                    </>
                  ) : null}
                </p>

                {/* Sort dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-primary"
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                  >
                    <ArrowDownUp className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    <span>{activeSort?.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </button>
                  {sortOpen && (
                    <ul
                      role="listbox"
                      aria-label="Sort options"
                      className="absolute right-0 top-full z-20 mt-2 min-w-[190px] overflow-hidden rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl shadow-black/10"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <li
                          key={opt.value}
                          role="option"
                          aria-selected={sort === opt.value}
                          onClick={() => { setSort(opt.value); setSortOpen(false); }}
                          className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition ${
                            sort === opt.value
                              ? "bg-secondary/6 font-semibold text-secondary"
                              : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                          }`}
                        >
                          {opt.label}
                          {sort === opt.value && (
                            <Check className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2.5} aria-hidden />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {isLoading
                  ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
                  : filteredProducts.map((product) => (
                      <Product key={product._id} product={product} />
                    ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="mx-auto mt-10 max-w-md rounded-3xl border border-gray-100 bg-gray-50 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-6 w-6 text-gray-400" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="text-lg font-bold text-primary">No products found</p>
              <p className="mt-2 text-sm text-gray-500">
                {hasSearch
                  ? <>No results for &ldquo;<strong>{search.trim()}</strong>&rdquo;. Try a different keyword.</>
                  : <>Try switching to <strong>All</strong> to browse everything available.</>}
              </p>
              <button
                onClick={() => { setFilter("All"); setSearch(""); }}
                className="mt-6 rounded-2xl bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90"
              >
                Show All Products
              </button>
            </div>
          )}

          {/* ── Shop by Need banner ── */}
          {!error && (
            <div className="mt-16 overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-[#FDFAF6] to-[#F5EFE4]">
              <div className="flex flex-col gap-8 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                    Shop by Need
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
                    One-time order or daily delivery — you choose
                  </h2>
                  <p className="mt-3 leading-relaxed text-gray-600">
                    Pick <strong>Milk</strong> for products that also work as subscriptions.
                    Pick <strong>Dairy</strong> for add-ons like paneer, curd, butter &amp; ghee.
                  </p>
                </div>

                <div className="flex shrink-0 gap-4">
                  <div className="flex min-w-[120px] flex-col items-center gap-2 rounded-2xl bg-white px-6 py-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                      <Milk className="h-5 w-5 text-blue-500" strokeWidth={1.75} aria-hidden />
                    </div>
                    <p className="text-2xl font-extrabold text-primary">
                      {isLoading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-gray-200" /> : milkCount}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Milk Options</p>
                  </div>
                  <div className="flex min-w-[120px] flex-col items-center gap-2 rounded-2xl bg-white px-6 py-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                      <Package className="h-5 w-5 text-amber-500" strokeWidth={1.75} aria-hidden />
                    </div>
                    <p className="text-2xl font-extrabold text-primary">
                      {isLoading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-gray-200" /> : dairyCount}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Dairy Add-ons</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
};

export default OrderNowPage;
