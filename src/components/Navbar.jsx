import React, { useState } from "react";
import { HiMenu, HiShoppingCart, HiX } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { useLogoutUserMutation } from "../features/api/authApi";
import CartBadge from "./CartBadge";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const [logoutUser] = useLogoutUserMutation();

  const menuLinks = [
    { text: "Home", path: "/" },
    { text: "Why Farmilky?", path: "/why-farmilky" },
    { text: "Contact Us", path: "/contact" },
    { text: "Order Now", path: "/order" },
  ];

  return (
    <>
      <nav className="bg-primary text-white">
        <div className="flex items-center justify-between max-w-7xl mx-auto p-4">
          
          <Link to="/" className="font-bold text-4xl">
            Farmilky
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-6 font-semibold relative">
            
            {menuLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `relative group cursor-pointer hover:text-accent transition-colors duration-300 ${
                      isActive ? "text-accent" : "" // Style for active link
                    }`
                  }
                >
                  {link.text}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300"></span>
                </NavLink>
              </li>
            ))}
          </ul>


          {/* Right Section: Login + Mobile Menu */}
          <div className="flex items-center gap-4">
            
            {!user ? (
              <Link
                to="/login"
                className="hidden md:block px-4 py-2 font-semibold bg-secondary rounded-2xl hover:bg-secondary/90 transition-colors"
              >
                Login
              </Link>
            ): (
              <div className="hidden md:block relative group">
                  <button className="flex items-center gap-2 font-semibold hover:text-secondary transition-colors py-2">
                       {user.name} 
                       <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col py-2">
                          <Link to="/my-orders" className="px-4 py-2 hover:bg-gray-50 hover:text-secondary text-left transition-colors">
                            My Orders
                          </Link>
                          <Link to="/subscriptions" className="px-4 py-2 hover:bg-gray-50 hover:text-secondary text-left transition-colors">
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-4xl"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <HiX /> : <HiMenu size={40} />}
            </button>

            <CartBadge />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="fixed top-[70px] left-0 right-0 mx-4 bg-primary/60 backdrop-blur-sm text-[#F9F5F0] flex flex-col items-center gap-4 p-6 font-semibold rounded-2xl shadow-2xl border border-white/10 transition-all duration-300 z-40">
          
          {menuLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `hover:text-accent transition-colors duration-300 ${
                    isActive ? "text-accent font-bold" : "" // Style for active link
                  }`
                }
                onClick={() => setMenuOpen(false)} // 8. Close menu on click
              >
                {link.text}
              </NavLink>
            </li>
          ))}
          
          {!user ? (
              <Link
                to="/login"
                className="hidden md:block px-4 py-2 font-semibold bg-secondary rounded-2xl hover:bg-secondary/90 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            ): (
              <>
               <Link
                    to="/my-orders"
                    className="hover:text-accent transition-colors"
                    onClick={() => setMenuOpen(false)}
                >
                    My Orders
                </Link>
                <Link
                    to="/subscriptions"
                    className="hover:text-accent transition-colors"
                    onClick={() => setMenuOpen(false)}
                >
                    My Subscriptions
                </Link>
                <button
                    onClick={() => {
                        logoutUser();
                        setMenuOpen(false);
                    }}
                    className="px-4 py-2 font-semibold bg-secondary rounded-2xl hover:bg-secondary/90 transition-colors"
                >
                    Logout
                </button>
              </>
            )}
        </ul>
      )}
    </>
  );
};

export default Navbar;