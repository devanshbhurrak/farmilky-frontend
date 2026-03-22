import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const menuItems = [
    { label: "Home", to: "/" },
    { label: "Why Farmilky?", to: "/why-farmilky" },
    { label: "Contact Us", to: "/contact" },
    { label: "Order Now", to: "/order" },
  ];

  const socialLinks = [
    { label: "Facebook", href: "mailto:shyambhurrak@gmail.com", icon: <FaFacebook /> },
    { label: "Twitter", href: "tel:+919424547907", icon: <FaTwitter /> },
    { label: "Instagram", href: "https://wa.me/919424547907", icon: <FaInstagram /> },
    { label: "LinkedIn", href: "mailto:shyambhurrak@gmail.com", icon: <FaLinkedin /> },
  ];

  return (
    <footer className="bg-primary text-[#F9F5F0]">
      <div className="app-shell py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          <div className="space-y-4">
            <p className="font-bold text-3xl sm:text-4xl">Farmilky</p>
            <p className="max-w-xs text-sm leading-6 text-gray-300">
              Fresh. Pure. Farm.
              <br />
              Delivered from our fields to your family.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex hover:text-secondary transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="leading-6">
                Farmilky Dairy, Amarpur, Patan
                <br />
                Jabalpur, Madhya Pradesh, 483113
              </li>
              <li>
                <a
                  href="tel:+919424547907"
                  className="font-medium hover:text-secondary transition-colors"
                >
                  +91 9424547907
                </a>
              </li>
              <li>
                <a
                  href="mailto:shyambhurrak@gmail.com"
                  className="hover:text-secondary transition-colors"
                >
                  shyambhurrak@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="text-2xl hover:text-secondary transition-colors"
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-6 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Farmilky. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
