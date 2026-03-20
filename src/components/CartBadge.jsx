import { FaShoppingCart } from "react-icons/fa";
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

  return (
    <Link to="/cart" className="relative">
      <FaShoppingCart className="text-xl text-white" size={28} />

      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartBadge;
