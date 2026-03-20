import React from "react";
import { FaCheckCircle, FaSeedling, FaTruck } from "react-icons/fa";
import { GiMilkCarton, GiFarmer } from "react-icons/gi";
import { BsFillPersonCheckFill } from "react-icons/bs";
import { Link } from "react-router-dom";

// Page component
export default function WhyFarmilkyPage() {
  return (
    <>
      <section className="bg-[#F9F5F0] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-secondary font-semibold">Our Promise</p>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mt-2">
            Why Farmilky?
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-6">
            We're on a simple mission: to bring pure, farm-fresh goodness
            directly to your family, every single day. Discover the
            difference that quality and care can make.
          </p>
        </div>
      </section>

      {/* 2. Detailed Features (Alternating Layout) */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 space-y-20">
          
          {/* Feature 1: Pure & Natural */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image Placeholder */}
            <div className="w-full rounded-2xl shadow-lg overflow-hidden"> 
    <img
      src="/milk.jpg" // Make sure this is in your /public folder
      alt="Pure, fresh Farmilky milk"
      className="w-full object-cover rounded-2xl" // REMOVED h-full
    />
  </div>
            {/* Text Content */}
            <div className="space-y-4">
              <FaSeedling size={40} className="text-secondary" />
              <h2 className="text-3xl font-bold text-primary">
                Absolutely Pure & Natural
              </h2>
              <p className="text-lg text-gray-600">
                Our milk is 100% pure, free from any preservatives, hormones,
                or additives. We believe in providing milk just as nature
                intended—rich, wholesome, and full of natural nutrients.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> No Preservatives
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Antibiotic-Free
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Daily Quality Checks
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2: Ethically Sourced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Content (Order reversed) */}
            <div className="space-y-4 md:order-last">
              <GiFarmer size={40} className="text-secondary" />
              <h2 className="text-3xl font-bold text-primary">
                Ethically & Sustainably Sourced
              </h2>
              <p className="text-lg text-gray-600">
                We partner directly with local, family-owned farms. Our cows
                are grass-fed, treated with care, and live happy, healthy
                lives. This not only ensures better milk but also supports our
                local farming community.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Support Local Farmers
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Happy, Grass-Fed Cows
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-secondary" /> Sustainable Farming Practices
                </li>
              </ul>
            </div>
            {/* Image Placeholder (Order reversed) */}
            <div className="w-full rounded-2xl shadow-lg overflow-hidden"> 
    <img
      src="/farmer.png" // Make sure this is in your /public folder
      alt="Pure, fresh Farmilky milk"
      className="w-full object-cover rounded-2xl" // REMOVED h-full
    />
  </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="bg-[#F9F5F0] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Freshness, simplified in 3 easy steps.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <BsFillPersonCheckFill
                size={50}
                className="text-secondary mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-primary mb-2">
                1. You Place an Order
              </h3>
              <p className="text-gray-600">
                Choose your products and set up a flexible delivery schedule
                that works for you.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <GiFarmer size={50} className="text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">
                2. We Source & Pack
              </h3>
              <p className="text-gray-600">
                Our farms freshly milk and pack your order just hours before
                delivery.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <FaTruck size={50} className="text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">
                3. We Deliver Fresh
              </h3>
              <p className="text-gray-600">
                You wake up to fresh, chilled milk and dairy products right on
                your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Final Call-to-Action (CTA) */}
      <section className="bg-secondary text-center py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Taste the Difference?
          </h2>
          <Link to='/order' onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="bg-[#F9F5F0] text-primary font-bold px-10 py-3 rounded-2xl hover:bg-white/90 transition-colors duration-300">
            Start Your Order
          </Link>
        </div>
      </section>

    </>
  );
}