import React from "react";
import { FaLeaf, FaShippingFast, FaAward, FaRecycle, FaTint, FaHeart } from "react-icons/fa";

const featuresData = [
  {
    icon: <FaLeaf size={40} className="text-secondary" />,
    title: "Pure & Natural",
    description:
      "No preservatives, no additives. Just 100% pure milk from healthy, happy cows.",
  },
  {
    icon: <FaShippingFast size={40} className="text-secondary" />,
    title: "Reliable Doorstep Delivery",
    description:
      "Wake up to fresh milk on your doorstep every morning. Simple, convenient, and always on time.",
  },
  {
    icon: <FaAward size={40} className="text-secondary" />,
    title: "Ethically Sourced",
    description:
      "We partner with local farms that prioritize animal welfare and sustainable practices.",
  },
  {
    icon: <FaRecycle size={40} className="text-secondary" />,
    title: "Eco-Friendly Packaging",
    description:
      "Our packaging is recyclable and eco-conscious — because purity should never harm the planet.",
  },
  {
    icon: <FaTint size={40} className="text-secondary" />,
    title: "Rich in Nutrition",
    description:
      "Loaded with calcium and essential nutrients, ensuring your family’s health in every drop.",
  },
  {
    icon: <FaHeart size={40} className="text-secondary" />,
    title: "Loved by Families",
    description:
      "Trusted by hundreds of families for our quality, freshness, and honest commitment to goodness.",
  },
];


const Features = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            The Farmilky Difference
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're not just another milk delivery. We're a promise of
            freshness and quality.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">{feature.icon}</div>
              {/* Title */}
              <h3 className="text-xl font-bold text-primary mb-2">
                {feature.title}
              </h3>
              {/* Description */}
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;