import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import { HiLockClosed, HiMail, HiPhone, HiUser } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "../features/api/authApi";

const AuthInput = ({ icon, ...props }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
    <span className="text-gray-400">{icon}</span>
    <input {...props} className="h-full w-full outline-none" />
  </div>
);

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginView = location.pathname !== "/signup";
  const redirectTo = location.state?.from
    ? `${location.state.from.pathname || ""}${location.state.from.search || ""}`
    : "/";

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerLoading,
      isSuccess: registerSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginLoading,
      isSuccess: loginSuccess,
    },
  ] = useLoginUserMutation();

  const [form, setForm] = useState(initialForm);
  const isSubmitting = loginLoading || registerLoading;

  useEffect(() => {
    setForm(initialForm);
  }, [location.pathname]);

  useEffect(() => {
    if (registerSuccess && registerData) {
      toast.success(registerData.message || "Signup successful");
      navigate(redirectTo, { replace: true });
    }

    if (registerError) {
      toast.error(registerError?.data?.message || "Signup failed");
    }

    if (loginSuccess && loginData) {
      toast.success(loginData.message || "Login successful");
      navigate(redirectTo, { replace: true });
    }

    if (loginError) {
      toast.error(loginError?.data?.message || "Login failed");
    }
  }, [
    loginData,
    loginError,
    loginSuccess,
    navigate,
    redirectTo,
    registerData,
    registerError,
    registerSuccess,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoginView) {
      loginUser({ email: form.email, password: form.password });
      return;
    }

    registerUser({
      name: form.name,
      phone: form.phone,
      email: form.email,
      password: form.password,
    });
  };

  return (
    <div className="page-shell flex items-center justify-center px-4">
      <div className="surface-card w-full max-w-md space-y-5 p-6 sm:p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-primary"
        >
          <FaArrowLeft className="text-xs" />
          Back to home
        </Link>

        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-primary">
            {isLoginView ? "Login to Your Account" : "Create Your Account"}
          </h2>
          <p className="text-sm text-gray-500">
            {isLoginView
              ? "Continue with your saved cart, subscriptions, and orders."
              : "Create your Farmilky account to order faster and manage deliveries."}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLoginView && (
            <>
              <AuthInput
                icon={<HiUser size={20} />}
                name="name"
                type="text"
                placeholder="Full Name"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
              />

              <AuthInput
                icon={<HiPhone size={20} />}
                name="phone"
                type="tel"
                placeholder="Phone"
                autoComplete="tel"
                inputMode="tel"
                required
                value={form.phone}
                onChange={handleChange}
              />
            </>
          )}

          <AuthInput
            icon={<HiMail size={20} />}
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
          />

          <AuthInput
            icon={<HiLockClosed size={20} />}
            name="password"
            type="password"
            placeholder="Password"
            autoComplete={isLoginView ? "current-password" : "new-password"}
            required
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-secondary px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : isLoginView ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            to={isLoginView ? "/signup" : "/login"}
            state={location.state}
            className="font-medium text-primary hover:text-secondary"
          >
            {isLoginView ? "Sign Up" : "Login"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
