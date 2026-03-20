import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useGetAllProductsQuery } from "../features/api/productApi";
import { useSelector } from "react-redux";
import Product from "../components/Product";

// Mock Product Data
// TODO: Replace with your actual product data, maybe from an API

// const productsData = [
//   {
//     id: 1,
//     name: "Fresh Cow Milk",
//     price: 60,
//     unit: "/ 1 Litre",
//     image: "/images/farmilky-bottle.jpg", // Use the path to your bottle image
//     category: "Milk",
//   },
//   {
//     id: 2,
//     name: "Fresh Paneer (Cottage Cheese)",
//     price: 120,
//     unit: "/ 250g",
//     image: "/images/paneer.jpg", // Create/find this image
//     category: "Dairy",
//   },
//   {
//     id: 3,
//     name: "Pure Desi Ghee",
//     price: 350,
//     unit: "/ 500g",
//     image: "/images/ghee.jpg", // Create/find this image
//     category: "Dairy",
//   },
// ];

const OrderNowPage = () => {
  const [filter, setFilter] = useState("All"); 

  const { data, isLoading, error } = useGetAllProductsQuery();
  const products = data?.products || [];
  const user = useSelector((state) => state.auth.user);

  // Filter products based on the selected category
  const filteredProducts = products.filter((product) => {
    if (filter === "All") return true;

    // Adjust category names to match backend
    if (filter === "Milk") return product.category === "milk";
    if (filter === "Dairy") return ["paneer", "ghee", "curd", "butter", "cheese"].includes(product.category);

    return true;
  });

  return (
    <>
      {/* 1. Page Hero Section */}
      <section className="bg-[#f8f3ee] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-secondary font-semibold">Shop Now</p>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mt-2">
            Our Fresh Products
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-6">
            Browse our selection of farm-fresh milk and dairy products,
            ready for delivery.
          </p>
        </div>
      </section>

      {/* 2. Products Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setFilter("All")}
              className={`px-6 py-2 font-semibold rounded-2xl transition-colors ${
                filter === "All"
                  ? "bg-secondary text-white"
                  : "bg-gray-200 text-primary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("Milk")}
              className={`px-6 py-2 font-semibold rounded-2xl transition-colors ${
                filter === "Milk"
                  ? "bg-secondary text-white"
                  : "bg-gray-200 text-primary"
              }`}
            >
              Milk
            </button>
            <button
              onClick={() => setFilter("Dairy")}
              className={`px-6 py-2 font-semibold rounded-2xl transition-colors ${
                filter === "Dairy"
                  ? "bg-secondary text-white"
                  : "bg-gray-200 text-primary"
              }`}
            >
              Dairy
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? 
            [...Array(6)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))  :
            filteredProducts.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderNowPage;

const ProductSkeleton = () => {
  return (
    <div className="bg-gray-100 rounded-2xl shadow-md animate-pulse overflow-hidden">
      <div className="h-48 bg-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-10 bg-gray-300 rounded mt-4"></div>
      </div>
    </div>
  );
};