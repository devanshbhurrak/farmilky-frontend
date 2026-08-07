import React from "react";
import { Mail, MessageCircle, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const menuItems = [
    { label: "Home", to: "/" },
    { label: "Why Farmilky?", to: "/why-farmilky" },
    { label: "Contact Us", to: "/contact" },
    { label: "Order Now", to: "/order" },
  ];

  const contactLinks = [
    { label: "Email us", href: "mailto:farmilky.official@gmail.com", icon: Mail },
    { label: "Call us", href: "tel:+919244237975", icon: Phone },
    { label: "WhatsApp", href: "https://wa.me/919244237975", icon: MessageCircle },
  ];

  return (
    <footer className="relative overflow-hidden bg-primary text-[#F9F5F0]">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/[0.05] blur-3xl" />
      </div>

      <div className="app-shell relative">
        {/* Main footer content */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-2 md:grid-cols-4 md:gap-x-12 md:py-16">

          {/* Brand */}
          <div className="col-span-2 space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo2.svg"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 shrink-0"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <span className="text-2xl font-extrabold tracking-tight">Farmilky</span>
            </div>
            <p className="max-w-[240px] text-sm leading-relaxed text-white/60">
              Fresh. Pure. Farm. Delivered with love from our fields to your family's table every morning.
            </p>
            {/* Social / contact icon row */}
            <div className="flex gap-2 pt-1">
              {contactLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:border-secondary/40 hover:bg-white/10 hover:text-secondary"
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Navigate</h3>
            <ul className="space-y-3">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-white/70 transition-colors duration-200 hover:text-secondary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a
                  href="tel:+919244237975"
                  className="flex items-center gap-2 transition-colors duration-200 hover:text-secondary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-white/30" strokeWidth={1.75} aria-hidden />
                  +91 92442 37975
                </a>
              </li>
              <li>
                <a
                  href="mailto:farmilky.official@gmail.com"
                  className="flex items-center gap-2 transition-colors duration-200 hover:text-secondary"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-white/30" strokeWidth={1.75} aria-hidden />
                  farmilky.official@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" strokeWidth={1.75} aria-hidden />
                <span className="leading-relaxed">Farmilky Dairy, Amarpur,<br />Patan, Jabalpur — 483113</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Delivery Hours</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center justify-between gap-4">
                <span>Mon – Sat</span>
                <span className="font-semibold text-white/90">5 AM – 8 AM</span>
              </li>
              <li className="flex items-center justify-between gap-4">
                <span>Sunday</span>
                <span className="font-semibold text-white/90">6 AM – 9 AM</span>
              </li>
              <li className="mt-2 rounded-xl border border-secondary/20 bg-secondary/10 px-3 py-2 text-xs text-secondary">
                Orders placed before midnight are delivered next morning.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-2 border-t border-white/10 py-6 text-center sm:flex-row sm:justify-between">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Farmilky. All Rights Reserved.
          </p>
          <p className="text-xs text-white/30">
            Made with care in Madhya Pradesh, India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
