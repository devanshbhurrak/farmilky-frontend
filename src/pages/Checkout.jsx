import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useGetCartQuery } from "../features/api/cartApi";
import {
  useCreateOrderMutation,
} from "../features/api/orderApi";
import {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
} from "../features/api/authApi";

const Checkout = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const { data: profileData } = useGetUserProfileQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });

  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(undefined, {
    skip: !user,
  });

  const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const profile = profileData?.user || user;
  const savedAddresses = useMemo(() => profile?.addresses || [], [profile?.addresses]);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedSavedKey, setSelectedSavedKey] = useState(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const cartItems = cartData?.items || [];
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
    0
  );

  useEffect(() => {
    if (
      savedAddresses.length > 0 &&
      !address.street &&
      !address.city &&
      !address.state &&
      !address.pincode &&
      selectedSavedKey === null
    ) {
      handleSelectSaved(savedAddresses[0], 0);
    }
  }, [address.city, address.pincode, address.state, address.street, savedAddresses, selectedSavedKey]);

  const validateAddress = (value) => {
    const nextErrors = {};
    const street = String(value.street ?? "").trim();
    const city = String(value.city ?? "").trim();
    const stateValue = String(value.state ?? "").trim();
    const pincode = String(value.pincode ?? "").trim();

    if (!street) nextErrors.street = "Street address is required";
    if (!city) nextErrors.city = "City is required";
    if (!stateValue) nextErrors.state = "State is required";

    if (!pincode) {
      nextErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(pincode)) {
      nextErrors.pincode = "Enter a valid 6-digit pincode";
    }

    return nextErrors;
  };

  const isAddressValid = Object.keys(validateAddress(address)).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue =
      name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value;

    const nextAddress = { ...address, [name]: sanitizedValue };

    setAddress(nextAddress);
    setSelectedSavedKey(null);
    setErrors((prev) => {
      const nextErrors = validateAddress(nextAddress);
      return { ...prev, [name]: nextErrors[name] };
    });
  };

  const handleSelectSaved = (savedAddr, index) => {
    const nextAddress = {
      street: savedAddr.street || "",
      city: savedAddr.city || "",
      state: savedAddr.state || "",
      pincode: savedAddr.pincode || "",
    };

    setAddress(nextAddress);
    setSelectedSavedKey(index);
    setSaveAddress(false);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validateAddress(address);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please correct the highlighted address fields");
      return;
    }

    try {
      const res = await createOrder({
        address,
        paymentMethod,
      }).unwrap();

      if (saveAddress && selectedSavedKey === null) {
        const nextAddresses = [
          ...savedAddresses,
          { ...address, type: savedAddresses.length ? "other" : "home" },
        ];

        try {
          await updateProfile({ addresses: nextAddresses }).unwrap();
        } catch {
          toast.error("Order placed, but we could not save this address");
        }
      }

      toast.success("Order placed successfully!");
      navigate(`/order-success/${res.order._id}`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to place order");
    }
  };

  if (!user) {
    return (
      <section className="page-shell">
        <div className="app-shell">
          <div className="surface-card mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">
              Login to continue
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Sign in to confirm your delivery details and place the order.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/login"
                state={{ from: { pathname: "/checkout" } }}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90"
              >
                Login to Continue
              </Link>
              <Link
                to="/cart"
                className="flex min-h-12 items-center justify-center rounded-2xl border border-primary/15 px-6 py-3 font-semibold text-primary transition hover:bg-primary/5"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isCartLoading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 text-center">
        <h2 className="mb-4 text-2xl font-bold">Your cart is empty</h2>
        <button
          onClick={() => navigate("/order")}
          className="rounded-xl bg-secondary px-6 py-2 text-white"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <section className="page-shell">
      <div className="app-shell grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="surface-card h-fit p-6 sm:p-8">

          <h2 className="mb-6 text-2xl font-bold text-primary">Shipping Details</h2>

          {savedAddresses.length > 0 && (
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-gray-500">
                Saved Addresses
              </p>
              <div className="grid grid-cols-1 gap-3">
                {savedAddresses.map((addr, idx) => (
                  <button
                    key={`${addr.street}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSaved(addr, idx)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                      selectedSavedKey === idx
                        ? "border-secondary bg-secondary/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        selectedSavedKey === idx
                          ? "border-secondary"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedSavedKey === idx && (
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {(addr.type || "saved").toUpperCase()}
                      </p>
                      <p className="truncate text-sm text-gray-600">
                        {addr.street}, {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-gray-600">Street Address</label>
              <input
                type="text"
                name="street"
                value={address.street}
                onChange={handleChange}
                autoComplete="street-address"
                className={`w-full rounded-xl border px-4 py-3 transition focus:border-secondary focus:outline-none ${
                  errors.street ? "border-red-400 bg-red-50/40" : "border-gray-300"
                }`}
                placeholder="House No, Street Name"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-500">{errors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-gray-600">City</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  className={`w-full rounded-xl border px-4 py-3 transition focus:border-secondary focus:outline-none ${
                    errors.city ? "border-red-400 bg-red-50/40" : "border-gray-300"
                  }`}
                  placeholder="City"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-gray-600">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleChange}
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={6}
                  className={`w-full rounded-xl border px-4 py-3 transition focus:border-secondary focus:outline-none ${
                    errors.pincode ? "border-red-400 bg-red-50/40" : "border-gray-300"
                  }`}
                  placeholder="123456"
                />
                {errors.pincode && (
                  <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-gray-600">State</label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleChange}
                autoComplete="address-level1"
                className={`w-full rounded-xl border px-4 py-3 transition focus:border-secondary focus:outline-none ${
                  errors.state ? "border-red-400 bg-red-50/40" : "border-gray-300"
                }`}
                placeholder="State"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state}</p>
              )}
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                disabled={selectedSavedKey !== null}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              <label
                htmlFor="saveAddress"
                className={`text-sm ${
                  selectedSavedKey !== null ? "text-gray-400" : "text-gray-700"
                }`}
              >
                Save this address for future orders
              </label>
            </div>

            <div className="pt-4">
              <h3 className="mb-4 text-xl font-bold text-primary">Payment Method</h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 font-semibold transition ${
                    paymentMethod === "COD"
                      ? "border-secondary bg-secondary/5 text-secondary"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  className="flex-1 cursor-not-allowed rounded-xl border-2 border-gray-100 px-4 py-3 text-gray-400"
                  disabled
                >
                  Online (Coming Soon)
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="surface-card h-fit p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 className="mb-6 text-2xl font-bold text-primary">Order Summary</h2>

          <div className="custom-scrollbar mb-6 max-h-80 space-y-4 overflow-y-auto pr-2">
            {cartItems.map((item) => {
              if (!item.productId) return null;

              return (
                <div
                  key={item.productId._id}
                  className="flex items-center gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0 sm:gap-4"
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 p-2 sm:h-16 sm:w-16">
                    <img
                      src={item.productId.image || "https://placehold.co/100"}
                      alt={item.productId.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold text-gray-800">
                      {item.productId.name}
                    </h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-right font-semibold">
                    Rs. {item.productId.price * item.quantity}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-gray-200 pt-4 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-green-600">Free</span>
            </div>
          </div>

          <div className="mt-4 mb-8 flex justify-between border-t border-gray-200 pt-4 text-xl font-bold text-primary">
            <span>Total</span>
            <span>Rs. {totalAmount}</span>
          </div>

          <button
            onClick={(e) => handleSubmit(e)}
            disabled={isOrdering || !isAddressValid}
            className="w-full rounded-xl bg-secondary py-4 text-lg font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isOrdering ? "Processing..." : `Place Order (Rs. ${totalAmount})`}
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            Review your address before placing the order. Cash on delivery is
            currently the available payment option.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
