import React from "react";
// We'll use these icons for the contact details
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp, // 1. Added WhatsApp Icon
} from "react-icons/fa";

const ContactPage = () => {
  return (
    <>
      {/* 1. Page Hero Section */}
      <section className="bg-[#F9F5F0] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-secondary font-semibold">Get in Touch</p>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mt-2">
            Contact Us
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-6">
            We're here to help! Whether you have a question about our products,
            delivery, or just want to say hello, we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* 2. Main Content (Info + Form) */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Column 1: Contact Information */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">
              Our Information
            </h2>
            <p className="text-lg text-gray-600">
              You can reach us using the details below or by filling out the
              contact form.
            </p>

            {/* Info Block: Email */}
            <div className="flex items-start gap-4">
              <div className="bg-secondary/10 p-3 rounded-full text-secondary">
                <FaEnvelope size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">Email Us</h3>
                <p className="text-gray-600">For support and inquiries:</p>
                <a
                  href="mailto:shyambhurrak@gmail.com"
                  className="text-primary font-medium hover:text-secondary"
                >
                  shyambhurrak@gmail.com
                </a>
              </div>
            </div>

            {/* Info Block: Phone */}
            <div className="flex items-start gap-4">
              <div className="bg-secondary/10 p-3 rounded-full text-secondary">
                <FaPhone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">Call Us</h3>
                <p className="text-gray-600">Anytime</p>
                <a
                  href="tel:+919424547907"
                  className="text-primary font-medium hover:text-secondary"
                >
                  +91 9424547907
                </a>
              </div>
            </div>

            {/* 2. Info Block: WhatsApp (NEW) */}
            <div className="flex items-start gap-4">
              <div className="bg-secondary/10 p-3 rounded-full text-secondary">
                <FaWhatsapp size={24} />
              </div>
              <div>
  <h3 className="text-xl font-semibold text-primary">WhatsApp Us</h3>
  <p className="text-gray-600">Chat with us directly:</p>
  <a
    href="https://wa.me/919424547907"
    className="text-primary font-medium hover:text-secondary transition-colors"
    target="_blank"
    rel="noopener noreferrer"
  >
    +91 9424547907
  </a>
</div>

            </div>

            {/* Info Block: Address */}
            <div className="flex items-start gap-4">
              <div className="bg-secondary/10 p-3 rounded-full text-secondary">
                <FaMapMarkerAlt size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">Our Farm</h3>
                <p className="text-gray-600">
                  Farmilky Dairy, Amarpur, Patan
                  <br />
                  Jabalpur, Madhya Pradesh, 482001
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Contact Form */}
          <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-primary mb-6">
              Send Us a Message
            </h2>
            <form action="#" method="POST" className="space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-secondary text-[#F9F5F0] font-semibold px-8 py-3 rounded-2xl hover:bg-secondary/90 transition-colors duration-300"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Map Section */}
      <section className="bg-white pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">
            Find Us Here
          </h2>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3666.246019598511!2d79.72262507387354!3d23.234132908402902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDE0JzAyLjkiTiA3OcKwNDMnMzAuNyJF!5e0!3m2!1sen!2sin!4v1761238773247!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;