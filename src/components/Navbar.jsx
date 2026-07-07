import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "../features/api/authApi";
import CartBadge from "./CartBadge";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [logoutUser] = useLogoutUserMutation();

  const menuLinks = [
    { text: "Home", path: "/" },
    { text: "Why Farmilky?", path: "/why-farmilky" },
    { text: "Contact Us", path: "/contact" },
    { text: "Order Now", path: "/order" },
  ];

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close dropdown on Escape key or click outside
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-primary text-white shadow-md">
        <div className="app-shell flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo2.svg"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <span className="font-bold text-2xl sm:text-3xl">Farmilky</span>
          </Link>

          <ul className="hidden md:flex gap-6 font-semibold relative">
            {menuLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `relative group cursor-pointer transition-colors duration-300 ${
                      isActive ? "text-accent" : "hover:text-accent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.text}
                      <span className={`absolute left-0 -bottom-1 h-[2px] bg-accent transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
                    </>
                  )}
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
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  aria-controls="user-dropdown-menu"
                  className="flex items-center gap-2 py-2 font-semibold transition-colors hover:text-secondary"
                >
                  <span className="max-w-32 truncate">{user.name}</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  id="user-dropdown-menu"
                  role="menu"
                  className={`absolute right-0 top-full z-50 mt-2 w-48 transition-all duration-200 ${
                    dropdownOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 text-gray-800 shadow-xl">
                      <Link
                        to="/profile"
                        role="menuitem"
                        className="px-4 py-2 text-left transition-colors hover:bg-gray-50 hover:text-secondary"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        role="menuitem"
                        className="px-4 py-2 text-left transition-colors hover:bg-gray-50 hover:text-secondary"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/subscriptions"
                        role="menuitem"
                        className="px-4 py-2 text-left transition-colors hover:bg-gray-50 hover:text-secondary"
                      >
                        My Subscriptions
                      </Link>
                      <Link
                        to="/passbook"
                        role="menuitem"
                        className="px-4 py-2 text-left transition-colors hover:bg-gray-50 hover:text-secondary"
                      >
                        My Passbook
                      </Link>
                      <Link
                        to="/my-complaints"
                        role="menuitem"
                        className="px-4 py-2 text-left transition-colors hover:bg-gray-50 hover:text-secondary"
                      >
                        My Complaints
                      </Link>
                      <button
                        onClick={() => logoutUser()}
                        role="menuitem"
                        className="mt-1 border-t border-gray-50 px-4 py-2 text-left transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
              </div>
            )}

            <CartBadge />

            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2 text-current"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              ) : (
                <Menu className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              )}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-primary/45 backdrop-blur-sm md:hidden" aria-modal="true" role="dialog" aria-label="Navigation menu">
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
                      to="/profile"
                      className="block rounded-2xl px-4 py-3 hover:bg-white/8 transition-colors"
                    >
                      My Profile
                    </Link>
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
                    <Link
                      to="/passbook"
                      className="block rounded-2xl px-4 py-3 hover:bg-white/8 transition-colors"
                    >
                      My Passbook
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/my-complaints"
                      className="block rounded-2xl px-4 py-3 hover:bg-white/8 transition-colors"
                    >
                      My Complaints
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
