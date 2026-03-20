import React from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const navigate = useNavigate();
  const product = item.productId;

  return (
    <article className="group relative bg-[#FFFEFC] border border-[#EDE6DC] rounded-[28px] p-6 sm:p-7 transition-all duration-300 hover:border-secondary/40 hover:bg-[#FFFDF9]">
      
      {/* subtle accent */}
      <span className="absolute inset-y-5 left-0 w-1 rounded-l-[28px] bg-secondary/70 opacity-0 group-hover:opacity-100 transition" />

      <div className="flex flex-col sm:flex-row gap-6">
        
        {/* IMAGE */}
        <div className="relative flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full sm:w-36 h-36 object-cover rounded-2xl bg-white"
          />
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col justify-between">
          
          {/* TITLE */}
          <div>
            <h3 className="text-xl sm:text-[22px] font-semibold text-primary leading-tight">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              ₹{product.price}
              <span className="text-gray-400"> / {product.unit}</span>
            </p>
          </div>

          {/* CONTROLS */}
          <div className="mt-6 flex flex-col gap-4">
            
            <div className="flex flex-wrap items-center gap-5">
              
              {/* Quantity pill */}
              <div className="flex items-center bg-[#F7F3ED] border border-[#E7DED2] rounded-full px-2 py-1">
                <button
                  onClick={() =>
                    onQuantityChange(product._id, item.quantity - 1)
                  }
                  className="w-8 h-8 flex items-center justify-center text-primary text-lg rounded-full hover:bg-white transition"
                >
                  −
                </button>

                <span className="w-10 text-center font-medium text-primary">
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    onQuantityChange(product._id, item.quantity + 1)
                  }
                  className="w-8 h-8 flex items-center justify-center text-primary text-lg rounded-full hover:bg-white transition"
                >
                  +
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => onRemove(product._id)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition"
              >
                <FaTrash className="text-xs" />
                Remove
              </button>
            </div>

            {/* Subscription CTA */}
            <button
              onClick={() =>
                navigate(`/subscribe?productId=${product._id}`)
              }
              className="self-start text-sm font-medium text-secondary hover:underline underline-offset-4"
            >
              Make this a daily subscription →
            </button>
          </div>
        </div>

        {/* PRICE */}
        <div className="flex sm:flex-col sm:items-end justify-between">
          <p className="text-lg sm:text-xl font-semibold text-primary">
            ₹{item.quantity * product.price}
          </p>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
