import React, { useState } from "react";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaWhatsapp,
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Farmilky inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:shyambhurrak@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <section className="page-hero">
        <div className="app-shell text-center">
          <p className="page-kicker">Get in Touch</p>
          <h1 className="page-title mt-2">
            Contact Us
          </h1>
          <p className="page-copy mx-auto mt-6">
            We&apos;re here to help. Whether you have a question about our
            products or delivery, we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 md:py-24">
        <div className="app-shell grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">Our Information</h2>
            <p className="text-lg text-gray-600">
              You can reach us using the details below or send a message from
              the contact form.
            </p>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <FaEnvelope size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">Email Us</h3>
                <p className="text-gray-600">For support and inquiries:</p>
                <a
                  href="mailto:shyambhurrak@gmail.com"
                  className="font-medium text-primary hover:text-secondary"
                >
                  shyambhurrak@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <FaPhone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">Call Us</h3>
                <p className="text-gray-600">Anytime</p>
                <a
                  href="tel:+919424547907"
                  className="font-medium text-primary hover:text-secondary"
                >
                  +91 9424547907
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <FaWhatsapp size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">WhatsApp Us</h3>
                <p className="text-gray-600">Chat with us directly:</p>
                <a
                  href="https://wa.me/919424547907"
                  className="font-medium text-primary transition-colors hover:text-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +91 9424547907
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
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

          <div className="surface-card bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-6 text-3xl font-bold text-primary">
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

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
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="min-h-12 w-full rounded-2xl bg-secondary px-8 py-3 font-semibold text-[#F9F5F0] transition-colors duration-300 hover:bg-secondary/90"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 md:pb-24">
        <div className="app-shell">
          <h2 className="mb-8 text-center text-3xl font-bold text-primary">
            Find Us Here
          </h2>
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3666.246019598511!2d79.72262507387354!3d23.234132908402902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDE0JzAyLjkiTiA3OcKwNDMnMzAuNyJF!5e0!3m2!1sen!2sin!4v1761238773247!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Farmilky location map"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
