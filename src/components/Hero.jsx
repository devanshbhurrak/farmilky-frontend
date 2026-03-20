import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 py-16 md:py-24">
        
        {/* Text Content */}
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-primary">
            Freshness Delivered,
            <br />
            Direct from the Farm.
          </h1>
          <p className="text-lg text-gray-700 max-w-lg mx-auto md:mx-0">
            Experience the pure taste of Farmilky. Our milk is sourced
            sustainably, processed with care, and delivered fresh to your
            doorstep every morning.
          </p>
          <Link to='/order' onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="bg-secondary text-[#F9F5F0] font-semibold px-8 py-3 rounded-2xl hover:bg-secondary/90 transition-colors duration-300">
            Order Now
          </Link>
        </div>

        {/* Image Placeholder */}
        <div className="flex items-center justify-center">

        
            <img 
              src="/hero.jpg" 
              alt="Farmilky fresh milk bottle"
              width={500}
              height={500}
              className="rounded-2xl shadow-lg object-cover"
            />
         
        </div>
      </div>
    </section>
  );
};

export default Hero;