import React, { useEffect, useRef, useState } from "react";
import { ClipboardList, Home, HelpCircle, LogOut, Menu, MessageSquare, Package, Phone, ShoppingBag, User, Wallet, X } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "../features/api/authApi";
import CartBadge from "./CartBadge";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [logoutUser] = useLogoutUserMutation();

  const openDrawer = () => { setMenuOpen(true); requestAnimationFrame(() => setDrawerVisible(true)); };
  const closeDrawer = () => { setDrawerVisible(false); setTimeout(() => setMenuOpen(false), 280); };

  const menuLinks = [
    { text: "Home", path: "/", icon: Home },
    { text: "Why Farmilky?", path: "/why-farmilky", icon: HelpCircle },
    { text: "Contact Us", path: "/contact", icon: Phone },
    { text: "Order Now", path: "/order", icon: ShoppingBag },
  ];

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    if (menuOpen) closeDrawer();
    setDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll while drawer is mounted
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white" aria-hidden>
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
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
                      {[
                        { to: "/profile", label: "My Profile" },
                        { to: "/my-orders", label: "My Orders" },
                        { to: "/subscriptions", label: "My Subscriptions" },
                        { to: "/passbook", label: "My Passbook" },
                        { to: "/my-complaints", label: "My Complaints" },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          className={`px-4 py-2 text-left transition-colors hover:bg-gray-50 hover:text-secondary ${
                            location.pathname === item.to || location.pathname.startsWith(item.to + "/")
                              ? "border-l-2 border-secondary bg-secondary/5 font-semibold text-secondary"
                              : ""
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
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
              onClick={menuOpen ? closeDrawer : openDrawer}
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

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" aria-modal="true" role="dialog" aria-label="Navigation menu">
          {/* Backdrop — fades in/out */}
          <div
            onClick={closeDrawer}
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "opacity-0"}`}
          />

          {/* Drawer panel — slides in from right */}
          <div className={`absolute right-0 top-0 flex h-full w-[80%] max-w-[300px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${drawerVisible ? "translate-x-0" : "translate-x-full"}`}>

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-6">
              <span className="text-base font-bold text-primary">Menu</span>
              <button
                onClick={closeDrawer}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              >
                <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </button>
            </div>

            {/* ── User card ── */}
            {user && (
              <Link to="/profile" className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 transition hover:bg-gray-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="truncate text-xs text-gray-400">{user.email}</p>
                </div>
              </Link>
            )}

            {/* ── Scrollable links ── */}
            <div className="flex flex-1 flex-col overflow-y-auto">

              {/* Nav links */}
              <div className="px-3 pb-1 pt-3">
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Pages</p>
                <ul>
                  {menuLinks.map((link, i) => {
                    const Icon = link.icon;
                    return (
                      <li
                        key={link.path}
                        style={{ transitionDelay: drawerVisible ? `${60 + i * 35}ms` : "0ms" }}
                        className={`transition-all duration-300 ${drawerVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
                      >
                        <NavLink
                          to={link.path}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                              isActive ? "bg-primary/8 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                            }`
                          }
                        >
                          <Icon className="h-4 w-4 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                          {link.text}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Account links */}
              {user ? (
                <div className="px-3 pb-1 pt-3">
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Account</p>
                  <ul>
                    {[
                      { to: "/profile",       label: "My Profile",       icon: User },
                      { to: "/my-orders",     label: "My Orders",        icon: Package },
                      { to: "/subscriptions", label: "My Subscriptions", icon: ClipboardList },
                      { to: "/passbook",      label: "My Passbook",      icon: Wallet },
                      { to: "/my-complaints", label: "My Complaints",    icon: MessageSquare },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                      return (
                        <li
                          key={item.to}
                          style={{ transitionDelay: drawerVisible ? `${200 + i * 35}ms` : "0ms" }}
                          className={`transition-all duration-300 ${drawerVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
                        >
                          <Link
                            to={item.to}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                              isActive ? "bg-primary/8 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="px-4 pt-4">
                  <Link
                    to="/login"
                    className="flex min-h-11 items-center justify-center rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary/90"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* ── Logout ── */}
            {user && (
              <div className="border-t border-gray-100 px-4 py-3">
                <button
                  onClick={() => { logoutUser(); closeDrawer(); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
