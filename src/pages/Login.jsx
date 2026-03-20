import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/authSlice"; // Adjust path to your authSlice
import { HiMail, HiLockClosed, HiUser, HiPhone } from "react-icons/hi";
import { useLoginUserMutation, useRegisterUserMutation } from "../features/api/authApi";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

const AuthInput = ({ icon, ...props }) => (
  <div className="flex items-center gap-3 border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-secondary">
    <span className="text-gray-400">{icon}</span>
    <input
      {...props}
      className="w-full h-full outline-none" 
    />
  </div>
);

const AuthPage = () => {

  const [
    registerUser,
    {data: registerData, error: registerError, isLoading: registerLoading, isSuccess: registerSuccess}
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {data: loginData, error: loginError, isLoading: loginLoading, isSuccess: loginSuccess}
  ] = useLoginUserMutation();

  const [isLoginView, setIsLoginView] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if(isLoginView) {
      loginUser({email, password})
    } else {
      registerUser({name, phone, email, password})
    }
  };

  useEffect(() => {
    if(registerSuccess && registerData) {
      toast.success(registerData.message || 'Signup Successful')
      navigate("/");
    }
    if(registerError) {
      toast.error(registerError?.data?.message || 'Signup Failed')
    }
    if(loginSuccess && loginData ){
      
      toast.success(loginData.message || 'Login Successful')
      navigate("/");
    }
    if(loginError) {
      toast.error(loginError?.data?.message || 'Login Failed')
    }
  }, [registerSuccess, loginSuccess, registerData, loginData, registerError, loginError])

  return (
    <div className="min-h-screen bg-[#F9F5F0] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-primary">
          {isLoginView ? "Login to Your Account" : "Create Your Account"}
        </h2>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* --- Sign Up Only Field --- */}
          {!isLoginView && <>
            <AuthInput
              icon={<HiUser size={20} />}
              id="name"
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <AuthInput
              icon={<HiPhone size={20} />}
              id="phone"
              type="phone"
              placeholder="Phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </>}

          {/* --- Common Fields --- */}
          <AuthInput
            icon={<HiMail size={20} />}
            id="email"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthInput
            icon={<HiLockClosed size={20} />}
            id="password"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot Password Link (Login only) */}
          {/* {isLoginView && (
            <div className="text-sm text-right">
              <Link
                to="/forgot-password" // You'll need to create this page later
                className="font-medium text-primary hover:text-secondary"
              >
                Forgot your password?
              </Link>
            </div>
          )} */}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-secondary flex items-center justify-center text-white font-semibold px-8 py-3 rounded-2xl hover:bg-secondary/90 transition-colors duration-300"
            >
              { (loginLoading || registerLoading) ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : isLoginView ? "Login" : "Create Account"}
            </button>
          </div>
        </form>

        {/* Toggle Link */}
        <div className="text-sm text-center text-gray-600">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLoginView(!isLoginView)} // Toggle the view
            className="font-medium text-primary hover:text-secondary focus:outline-none"
          >
            {isLoginView ? "Sign Up" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;