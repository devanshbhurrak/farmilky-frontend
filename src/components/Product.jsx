import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useGetCartQuery,
} from "../features/api/cartApi";
import { useSelector } from "react-redux";

const Product = ({ product }) => {
  const user = useSelector((state) => state.auth.user);

  const { data: cart } = useGetCartQuery(undefined, {
    skip: !user,
  });

  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  const cartItem = cart?.items?.find(
    (item) => item.productId._id === product._id
  );

  const quantity = cartItem?.quantity || 0;

  const handleAdd = async () => {
    if (!user) {
      toast.error("Please login to add items");
      return;
    }
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        _product: product // pass full product for optimistic update
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
    });
  };

  const handleDecrease = async () => {
    if (quantity === 1) {
      await removeFromCart({ productId: product._id });
    } else {
      await updateCartItem({
        productId: product._id,
        quantity: quantity - 1,
      });
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition">
      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-64 object-contain"
      />

      {/* Info */}
      <div className="p-6 flex flex-col grow">
        <h3 className="text-2xl font-bold text-primary">{product.name}</h3>

        <p className="text-xl font-semibold text-secondary mt-2">
          ₹{product.price}{" "}
          <span className="text-base text-gray-600">{product.unit}</span>
        </p>

        {/* CART BUTTON */}
        <div className="mt-6">
          {quantity === 0 ? (
            <button
              disabled={adding}
              onClick={handleAdd}
              className="w-full bg-secondary text-white font-semibold px-6 py-3 rounded-2xl hover:bg-secondary/90 transition flex items-center justify-center gap-2"
            >
              <FaShoppingCart />
              Add to Cart
            </button>
          ) : (
            <div className="w-full flex items-center justify-between bg-[#F7F3ED] border border-[#E7DED2] rounded-2xl px-4 py-2">
              <button
                onClick={handleDecrease}
                className="w-10 h-10 rounded-full bg-white text-primary text-xl hover:bg-gray-100 transition"
              >
                −
              </button>

              <span className="font-semibold text-primary text-lg">
                {quantity}
              </span>

              <button
                onClick={handleIncrease}
                className="w-10 h-10 rounded-full bg-white text-primary text-xl hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
