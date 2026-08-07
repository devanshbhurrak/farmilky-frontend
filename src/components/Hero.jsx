import React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-secondary/[0.06] blur-3xl" />
      </div>

      <div className="app-shell relative grid grid-cols-1 items-center gap-8 py-10 md:grid-cols-2 md:gap-16 md:py-24 lg:py-28">
        {/* Image — above text on mobile */}
        <div className="order-first flex items-center justify-center md:order-last">
          <div className="relative w-full max-w-sm md:max-w-none">
            {/* Decorative ring behind image */}
            <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 blur-xl" aria-hidden />
            <img
              src="/hero.jpg"
              alt="Farmilky fresh milk bottle"
              width={560}
              height={560}
              fetchPriority="high"
              decoding="async"
              className="relative z-10 max-h-[260px] w-full rounded-3xl object-cover shadow-2xl shadow-primary/10 ring-1 ring-white/60 sm:max-h-[320px] md:max-h-[480px]"
            />
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 z-20 hidden rounded-2xl bg-white px-4 py-3 shadow-xl shadow-primary/10 ring-1 ring-gray-100 sm:flex sm:items-center sm:gap-2.5 md:-left-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Fresh Daily</p>
              </div>
            </div>
            {/* Second floating badge */}
            <div className="absolute -top-4 -right-4 z-20 hidden rounded-2xl bg-white px-4 py-3 shadow-xl shadow-primary/10 ring-1 ring-gray-100 sm:flex sm:items-center sm:gap-2.5 md:-right-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                <ShieldCheck className="h-5 w-5 text-secondary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">50+ Families</p>
                <p className="text-[10px] text-gray-400">Trust Farmilky</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="order-last space-y-6 text-center md:order-first md:text-left">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5 text-secondary" strokeWidth={2.5} aria-hidden />
            India&apos;s Trusted Farm-to-Door Dairy
          </div>

          <h1 className="page-title leading-[1.05]">
            Freshness Delivered,{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 text-secondary">Direct</span>
              <svg
                className="absolute -bottom-1 left-0 z-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path d="M0 6 Q100 0 200 6" stroke="#f97a00" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4" />
              </svg>
            </span>{" "}
            from the Farm.
          </h1>

          <p className="page-copy mx-auto text-sm leading-7 md:mx-0 md:text-base">
            Experience the pure taste of Farmilky. Our milk is sourced
            sustainably, processed with care, and delivered fresh to your
            doorstep every morning.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              to="/order"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary px-8 py-3 font-semibold text-white shadow-lg shadow-secondary/25 transition-all duration-300 hover:bg-secondary/90 hover:shadow-xl hover:shadow-secondary/30 active:scale-[0.98]"
            >
              Order Now
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              to="/why-farmilky"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white px-8 py-3 font-semibold text-primary transition-all duration-300 hover:border-primary/30 hover:bg-primary/5"
            >
              Why Farmilky?
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 md:justify-start">
            {[
              { label: "100% Pure", color: "bg-green-500" },
              { label: "Daily Delivery", color: "bg-secondary" },
              { label: "No Preservatives", color: "bg-primary" },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:text-sm">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${item.color}`} aria-hidden />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
