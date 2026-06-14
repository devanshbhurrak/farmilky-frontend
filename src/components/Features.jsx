import React from "react";
import { Award, Droplets, Heart, Leaf, Recycle, Truck } from "lucide-react";

const iconClass = "h-10 w-10 text-secondary";
const iconStroke = 1.5;

const featuresData = [
  {
    icon: <Leaf className={iconClass} strokeWidth={iconStroke} aria-hidden />,
    title: "Pure & Natural",
    description:
      "No preservatives, no additives. Just 100% pure milk from healthy, happy cows.",
  },
  {
    icon: <Truck className={iconClass} strokeWidth={iconStroke} aria-hidden />,
    title: "Reliable Doorstep Delivery",
    description:
      "Wake up to fresh milk on your doorstep every morning. Simple, convenient, and always on time.",
  },
  {
    icon: <Award className={iconClass} strokeWidth={iconStroke} aria-hidden />,
    title: "Ethically Sourced",
    description:
      "We partner with local farms that prioritize animal welfare and sustainable practices.",
  },
  {
    icon: <Recycle className={iconClass} strokeWidth={iconStroke} aria-hidden />,
    title: "Eco-Friendly Packaging",
    description:
      "Our packaging is recyclable and eco-conscious because purity should never harm the planet.",
  },
  {
    icon: <Droplets className={iconClass} strokeWidth={iconStroke} aria-hidden />,
    title: "Rich in Nutrition",
    description:
      "Loaded with calcium and essential nutrients, ensuring your family's health in every drop.",
  },
  {
    icon: <Heart className={iconClass} strokeWidth={iconStroke} aria-hidden />,
    title: "Loved by Families",
    description:
      "Trusted by hundreds of families for our quality, freshness, and honest commitment to goodness.",
  },
];

const Features = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="app-shell">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-primary md:text-4xl">
            The Farmilky Difference
          </h2>
          <p className="page-copy mx-auto text-lg">
            We're not just another milk delivery. We're a promise of freshness
            and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {featuresData.map((feature) => (
            <div
              key={feature.title}
              className="surface-card p-6 text-center transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-primary">
                {feature.title}
              </h3>
              <p className="leading-7 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
