import React from "react";
// Using icons from react-icons
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa"

const Footer = () => {
  // You can reuse the menu items from your Navbar for consistency
  const menuItems = ["Home", "Why Farmilky?", "Contact Us", "Order Now"];

  return (
    <footer className="bg-primary text-[#F9F5F0]">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <p className="font-bold text-4xl">Farmilky</p>
            <p className="text-sm text-gray-300">
              Fresh. Pure. Farm.
              <br />
              Delivered from our fields to your family.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-secondary transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Farmilky Dairy, Amarpur, Patan
                  <br />
                  Jabalpur, Madhya Pradesh, 483113</li>
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

          {/* Column 4: Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-2xl hover:text-secondary transition-colors"
              >
                <FaFacebook />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-2xl hover:text-secondary transition-colors"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-2xl hover:text-secondary transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-2xl hover:text-secondary transition-colors"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar: Copyright */}
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