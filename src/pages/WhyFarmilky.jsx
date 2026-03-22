import React from "react";
import { BsFillPersonCheckFill } from "react-icons/bs";
import { FaCheckCircle, FaSeedling, FaTruck } from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";
import { Link } from "react-router-dom";

export default function WhyFarmilkyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="app-shell text-center">
          <p className="page-kicker">Our Promise</p>
          <h1 className="page-title mt-2">
            Why Farmilky?
          </h1>
          <p className="page-copy mx-auto mt-6">
            We&apos;re on a simple mission: to bring pure, farm-fresh goodness
            directly to your family every single day.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 md:py-24">
        <div className="app-shell space-y-16 md:space-y-20">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <img
                src="/milk.jpg"
                alt="Pure, fresh Farmilky milk"
                className="w-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <FaSeedling size={40} className="text-secondary" />
              <h2 className="text-3xl font-bold text-primary">
                Absolutely Pure and Natural
              </h2>
              <p className="text-lg text-gray-600">
                Our milk is 100% pure, free from preservatives, hormones, and
                additives. We believe in providing milk just as nature intended.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> No preservatives
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Antibiotic-free
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Daily quality checks
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="space-y-4 md:order-last">
              <GiFarmer size={40} className="text-secondary" />
              <h2 className="text-3xl font-bold text-primary">
                Ethically and Sustainably Sourced
              </h2>
              <p className="text-lg text-gray-600">
                We partner directly with local, family-owned farms where cows
                are treated with care and farmers are supported fairly.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Support local farmers
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Happy, grass-fed cows
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Sustainable farming practices
                </li>
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <img
                src="/farmer.png"
                alt="Farmilky farmers"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="page-hero">
        <div className="app-shell">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-primary md:text-4xl">
              How It Works
            </h2>
            <p className="page-copy mx-auto text-lg">
              Freshness, simplified in 3 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3 md:gap-8">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <BsFillPersonCheckFill
                size={50}
                className="mx-auto mb-4 text-secondary"
              />
              <h3 className="mb-2 text-xl font-bold text-primary">
                1. You Place an Order
              </h3>
              <p className="text-gray-600">
                Choose your products and set up a delivery schedule that works
                for you.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <GiFarmer size={50} className="mx-auto mb-4 text-secondary" />
              <h3 className="mb-2 text-xl font-bold text-primary">
                2. We Source and Pack
              </h3>
              <p className="text-gray-600">
                Our farms milk and pack your order just hours before delivery.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <FaTruck size={50} className="mx-auto mb-4 text-secondary" />
              <h3 className="mb-2 text-xl font-bold text-primary">
                3. We Deliver Fresh
              </h3>
              <p className="text-gray-600">
                You wake up to fresh, chilled milk and dairy products at your
                doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16 text-center md:py-20">
        <div className="app-shell">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Ready to Taste the Difference?
          </h2>
          <Link
            to="/order"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-background px-10 py-3 font-bold text-primary transition-colors duration-300 hover:bg-white/90"
          >
            Start Your Order
          </Link>
        </div>
      </section>
    </>
  );
}
