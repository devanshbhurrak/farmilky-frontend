import React from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const navigate = useNavigate();
  const product = item.productId;

  return (
    <article className="group relative rounded-[28px] border border-[#EDE6DC] bg-[#FFFEFC] p-5 transition-all duration-300 hover:border-secondary/40 hover:bg-[#FFFDF9] sm:p-7">
      <span className="absolute inset-y-5 left-0 w-1 rounded-l-[28px] bg-secondary/70 opacity-0 transition group-hover:opacity-100" />

      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <div className="relative flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="h-32 w-full rounded-2xl bg-white object-contain p-3 sm:h-36 sm:w-36"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold leading-tight text-primary sm:text-[22px]">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Rs. {product.price}
              <span className="text-gray-400"> / {product.unit}</span>
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <div className="flex items-center rounded-full border border-[#E7DED2] bg-[#F7F3ED] px-2 py-1">
                <button
                  onClick={() =>
                    item.quantity === 1
                      ? onRemove(product._id)
                      : onQuantityChange(product._id, item.quantity - 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-primary transition hover:bg-white"
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  -
                </button>

                <span className="w-10 text-center font-medium text-primary">
                  {item.quantity}
                </span>

                <button
                  onClick={() => onQuantityChange(product._id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-primary transition hover:bg-white"
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => onRemove(product._id)}
                className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-red-500"
              >
                <FaTrash className="text-xs" />
                Remove
              </button>
            </div>

            <button
              onClick={() => navigate(`/subscribe?productId=${product._id}`)}
              className="self-start text-left text-sm font-medium text-secondary underline-offset-4 hover:underline"
            >
              Make this a daily subscription
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-end">
          <p className="text-lg font-semibold text-primary sm:text-xl">
            Rs. {item.quantity * product.price}
          </p>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
