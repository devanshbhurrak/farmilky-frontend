import React, { useState } from "react";
import toast from "react-hot-toast";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useSubmitContactMessageMutation } from "../features/api/contactApi";

const EMPTY_FORM = { name: "", email: "", message: "" };

const ContactPage = () => {
  useDocumentTitle("Contact Us");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitContactMessage, { isLoading }] = useSubmitContactMessageMutation();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitContactMessage(formData).unwrap();
      setFormData(EMPTY_FORM);
      setSubmitted(true);
      toast.success("Message sent! We'll be in touch soon.");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="app-shell text-center">
          <p className="page-kicker">Get in Touch</p>
          <h1 className="page-title mt-2">Contact Us</h1>
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
                <Mail className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">Email Us</h3>
                <p className="text-gray-600">For support and inquiries:</p>
                <a
                  href="mailto:farmilky.official@gmail.com"
                  className="font-medium text-primary hover:text-secondary"
                >
                  farmilky.official@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <Phone className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">Call Us</h3>
                <p className="text-gray-600">Anytime</p>
                <a
                  href="tel:+9192442 37975"
                  className="font-medium text-primary hover:text-secondary"
                >
                  +91 92442 37975
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <MessageCircle className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">WhatsApp Us</h3>
                <p className="text-gray-600">Chat with us directly:</p>
                <a
                  href="https://wa.me/9192442 37975"
                  className="font-medium text-primary transition-colors hover:text-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +91 92442 37975
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <MapPin className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">Our Farm</h3>
                <p className="text-gray-600">
                  Farmilky Dairy, Amarpur, Patan
                  <br />
                  Jabalpur, Madhya Pradesh, 483113
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-6 text-3xl font-bold text-primary">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-primary">Message Sent!</h3>
                <p className="text-gray-600">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 rounded-2xl border border-primary/20 px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
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
                    maxLength={100}
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
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
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    maxLength={2000}
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 block w-full resize-none rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">
                    {formData.message.length}/2000
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="min-h-12 w-full rounded-2xl bg-secondary px-8 py-3 font-semibold text-[#F9F5F0] transition-colors duration-300 hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
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
