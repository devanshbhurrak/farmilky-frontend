import { Award, Droplets, Heart, Leaf, Recycle, Truck } from "lucide-react";

const featuresData = [
  {
    icon: Leaf,
    title: "Pure & Natural",
    description: "No preservatives, no additives. Just 100% pure milk from healthy, happy cows.",
    gradient: "from-emerald-500 to-green-400",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "group-hover:border-emerald-200",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    description: "Wake up to fresh milk on your doorstep every morning. Simple, convenient, always on time.",
    gradient: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "group-hover:border-blue-200",
  },
  {
    icon: Award,
    title: "Ethically Sourced",
    description: "We partner with local farms that prioritize animal welfare and sustainable practices.",
    gradient: "from-amber-500 to-yellow-400",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "group-hover:border-amber-200",
  },
  {
    icon: Recycle,
    title: "Eco-Friendly",
    description: "Our packaging is recyclable and eco-conscious — purity should never harm the planet.",
    gradient: "from-teal-500 to-green-400",
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
    border: "group-hover:border-teal-200",
  },
  {
    icon: Droplets,
    title: "Rich in Nutrition",
    description: "Loaded with calcium and essential nutrients, ensuring your family's health in every drop.",
    gradient: "from-sky-500 to-indigo-400",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    border: "group-hover:border-sky-200",
  },
  {
    icon: Heart,
    title: "Loved by Families",
    description: "Trusted by hundreds of families for our quality, freshness, and honest commitment to goodness.",
    gradient: "from-rose-500 to-pink-400",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
    border: "group-hover:border-rose-200",
  },
];

const Features = () => {
  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-24 lg:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/[0.03] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-secondary/[0.04] blur-3xl" aria-hidden />

      <div className="app-shell relative">
        {/* Section header */}
        <div className="mx-auto mb-12 max-w-xl text-center md:mb-16">
          <span className="page-kicker">Why Choose Us</span>
          <h2 className="page-title mt-3 mb-4">The Farmilky Difference</h2>
          <p className="page-copy mx-auto">
            We&apos;re not just another milk delivery. We&apos;re a promise of freshness
            and quality that your family deserves.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {featuresData.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative cursor-default overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6 lg:p-7 ${feature.border}`}
              >
                {/* Gradient accent strip at top */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} aria-hidden />

                <div className={`mb-3 inline-flex rounded-xl ${feature.bg} p-2.5 sm:mb-4 sm:rounded-2xl sm:p-3`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.iconColor}`} strokeWidth={1.75} aria-hidden />
                </div>

                <h3 className="mb-1.5 text-xs font-bold text-primary sm:mb-2 sm:text-sm lg:text-base">
                  {feature.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-gray-500 sm:text-xs lg:text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
