import { useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useGetCartQuery } from "../features/api/cartApi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const CartBadge = () => {
  const user = useSelector((state) => state.auth.user);

  const { data } = useGetCartQuery(undefined, {
    skip: !user,
  });

  const totalItems =
    data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const badgeRef = useRef(null);
  const prevCount = useRef(totalItems);

  useEffect(() => {
    if (totalItems !== prevCount.current && totalItems > 0 && badgeRef.current) {
      badgeRef.current.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.4)" },
          { transform: "scale(1)" },
        ],
        { duration: 300, easing: "ease-out" }
      );
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  return (
    <Link
      to="/cart"
      className="relative"
      aria-label={totalItems > 0 ? `Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}` : "Cart"}
    >
      <ShoppingCart className="h-7 w-7 text-white" strokeWidth={1.75} aria-hidden />

      {totalItems > 0 && (
        <span ref={badgeRef} className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center" aria-hidden="true">
          {totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartBadge;
