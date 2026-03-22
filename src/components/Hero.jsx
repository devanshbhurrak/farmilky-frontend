import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-background">
      <div className="app-shell grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2 md:gap-12 md:py-24">
        <div className="space-y-6 text-center md:text-left">
          <h1 className="page-title">
            Freshness Delivered,
            <br />
            Direct from the Farm.
          </h1>
          <p className="page-copy mx-auto md:mx-0">
            Experience the pure taste of Farmilky. Our milk is sourced
            sustainably, processed with care, and delivered fresh to your
            doorstep every morning.
          </p>
          <Link
            to="/order"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-secondary px-8 py-3 font-semibold text-[#F9F5F0] transition-colors duration-300 hover:bg-secondary/90"
          >
            Order Now
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <img
            src="/hero.jpg"
            alt="Farmilky fresh milk bottle"
            width={500}
            height={500}
            className="max-h-[420px] w-full max-w-md rounded-3xl object-cover shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
