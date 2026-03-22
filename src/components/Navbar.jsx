import React, { useEffect, useState } from "react";
import { HiMenu, HiShoppingCart, HiX } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "../features/api/authApi";
import CartBadge from "./CartBadge";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [logoutUser] = useLogoutUserMutation();

  const menuLinks = [
    { text: "Home", path: "/" },
    { text: "Why Farmilky?", path: "/why-farmilky" },
    { text: "Contact Us", path: "/contact" },
    { text: "Order Now", path: "/order" },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-primary text-white shadow-md">
        <div className="app-shell flex items-center justify-between py-4">
          <Link to="/" className="font-bold text-2xl sm:text-3xl">
            Farmilky
          </Link>

          <ul className="hidden md:flex gap-6 font-semibold relative">
            {menuLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `relative group cursor-pointer hover:text-accent transition-colors duration-300 ${
                      isActive ? "text-accent" : ""
                    }`
                  }
                >
                  {link.text}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300"></span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 sm:gap-4">
            {!user ? (
              <Link
                to="/login"
                className="hidden md:block px-4 py-2 font-semibold bg-secondary rounded-2xl hover:bg-secondary/90 transition-colors"
              >
                Login
              </Link>
            ) : (
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 font-semibold hover:text-secondary transition-colors py-2">
                  <span className="max-w-32 truncate">{user.name}</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col py-2">
                    <Link
                      to="/my-orders"
                      className="px-4 py-2 hover:bg-gray-50 hover:text-secondary text-left transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/subscriptions"
                      className="px-4 py-2 hover:bg-gray-50 hover:text-secondary text-left transition-colors"
                    >
                      My Subscriptions
                    </Link>
                    <button
                      onClick={() => logoutUser()}
                      className="px-4 py-2 hover:bg-red-50 hover:text-red-600 text-left transition-colors border-t border-gray-50 mt-1"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            <CartBadge />

            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2 text-3xl"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-primary/45 backdrop-blur-sm md:hidden">
          <div className="mx-4 mt-24 rounded-3xl border border-white/10 bg-primary text-[#F9F5F0] shadow-2xl">
            <ul className="flex flex-col gap-1 p-4 text-base font-semibold">
              {menuLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 transition-colors duration-300 ${
                        isActive ? "bg-white/10 text-accent" : "hover:bg-white/8"
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                </li>
              ))}

              {!user ? (
                <li>
                  <Link
                    to="/login"
                    className="mt-2 block rounded-2xl bg-secondary px-4 py-3 text-center font-semibold text-white"
                  >
                    Login
                  </Link>
                </li>
              ) : (
                <>
                  <li className="px-4 pt-3 text-sm text-white/70">
                    Signed in as {user.name}
                  </li>
                  <li>
                    <Link
                      to="/my-orders"
                      className="block rounded-2xl px-4 py-3 hover:bg-white/8 transition-colors"
                    >
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/subscriptions"
                      className="block rounded-2xl px-4 py-3 hover:bg-white/8 transition-colors"
                    >
                      My Subscriptions
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        logoutUser();
                        setMenuOpen(false);
                      }}
                      className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-white"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
