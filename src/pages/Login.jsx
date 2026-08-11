import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "../features/api/authApi";

const AuthInput = ({ icon, label, id, rightAddon, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <div className="flex items-center gap-3 rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
      <span className="text-gray-400" aria-hidden>{icon}</span>
      <input id={id} {...props} className="h-full min-w-0 flex-1 outline-none focus-visible:outline-none" />
      {rightAddon}
    </div>
  </div>
);

const getPasswordStrength = (password) => {
  if (!password) return null;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (password.length < 6) return { level: 1, label: "Weak", color: "bg-red-400" };
  if (password.length < 10 && score < 2) return { level: 2, label: "Fair", color: "bg-orange-400" };
  if (password.length >= 8 && score >= 2) return { level: 3, label: "Strong", color: "bg-green-500" };
  return { level: 2, label: "Fair", color: "bg-orange-400" };
};

const initialForm = {
  name: "",
  identifier: "",
  email: "",
  password: "",
  phone: "",
};

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginView = location.pathname !== "/signup"
  useDocumentTitle(isLoginView ? "Login" : "Create Account")
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
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isSubmitting = loginLoading || registerLoading;

  useEffect(() => {
    setForm(initialForm);
    setPhoneError("");
    setShowPassword(false);
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
    // Strip non-digits from phone input as the user types
    const sanitized = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    if (name === "phone") setPhoneError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoginView) {
      loginUser({ identifier: form.identifier.trim(), password: form.password });
      return;
    }

    // Validate Indian mobile number: starts with 6-9, exactly 10 digits
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    const payload = { name: form.name, phone: form.phone, password: form.password };
    if (form.email.trim()) payload.email = form.email.trim();
    registerUser(payload);
  };

  return (
    <div className="page-shell flex items-center justify-center px-4">
      <div className="surface-card w-full max-w-md space-y-5 p-6 sm:p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
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
                id="signup-name"
                label="Full Name"
                icon={<User className="h-5 w-5" strokeWidth={1.75} />}
                name="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
              />

              <AuthInput
                id="signup-phone"
                label="Phone Number"
                icon={<Phone className="h-5 w-5" strokeWidth={1.75} />}
                name="phone"
                type="tel"
                placeholder="10-digit mobile number"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={form.phone}
                onChange={handleChange}
              />
              {phoneError && (
                <p className="-mt-3 text-sm text-red-500">{phoneError}</p>
              )}
            </>
          )}

          {isLoginView ? (
            <AuthInput
              id="login-identifier"
              label="Email or Phone Number"
              icon={<Mail className="h-5 w-5" strokeWidth={1.75} />}
              name="identifier"
              type="text"
              placeholder="you@example.com or 9876543210"
              autoComplete="username"
              required
              value={form.identifier}
              onChange={handleChange}
            />
          ) : (
            <AuthInput
              id="signup-email"
              label="Email Address (optional)"
              icon={<Mail className="h-5 w-5" strokeWidth={1.75} />}
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
            />
          )}

          <AuthInput
            id={isLoginView ? "login-password" : "signup-password"}
            label="Password"
            icon={<Lock className="h-5 w-5" strokeWidth={1.75} />}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={isLoginView ? "Your password" : "Create a password"}
            autoComplete={isLoginView ? "current-password" : "new-password"}
            required
            value={form.password}
            onChange={handleChange}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  : <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
              </button>
            }
          />
          {isLoginView && (
            <div className="-mt-3 text-right">
              <a
                href="https://wa.me/919244237975?text=Hi%2C%20I%20need%20help%20resetting%20my%20Farmilky%20password."
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-gray-500 transition hover:text-secondary"
              >
                Forgot password?
              </a>
            </div>
          )}
          {!isLoginView && form.password && (() => {
            const strength = getPasswordStrength(form.password);
            return (
              <div className="-mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        n <= strength.level ? strength.color : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Password strength: <span className="font-medium">{strength.label}</span></p>
              </div>
            );
          })()}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-secondary px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" strokeWidth={2} aria-hidden />
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
