import React from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const menuItems = [
    { label: "Home", to: "/" },
    { label: "Why Farmilky?", to: "/why-farmilky" },
    { label: "Contact Us", to: "/contact" },
    { label: "Order Now", to: "/order" },
  ];

  const contactLinks = [
    { label: "Email", href: "mailto:shyambhurrak@gmail.com", icon: Mail },
    { label: "Phone", href: "tel:+919424547907", icon: Phone },
    { label: "WhatsApp", href: "https://wa.me/919424547907", icon: MessageCircle },
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
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {contactLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[#F9F5F0] transition-colors hover:border-secondary/60 hover:bg-white/10 hover:text-secondary"
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <IconComponent className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </a>
              );
              })}
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
