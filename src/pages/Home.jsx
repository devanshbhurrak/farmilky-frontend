import React from 'react'
import { Tractor, Truck, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import Features from '../components/Features'
import useDocumentTitle from '../hooks/useDocumentTitle'

const howItWorks = [
  { icon: UserCheck, title: "Place Your Order", desc: "Choose products and set a delivery schedule." },
  { icon: Tractor, title: "We Source & Pack", desc: "Freshly milked and packed hours before delivery." },
  { icon: Truck, title: "Delivered Fresh", desc: "Wake up to farm-fresh goodness at your doorstep." },
];

const Home = () => {
  useDocumentTitle("")
  return (
    <>
      <Hero />
      <Features />

      <section className="bg-background py-16 md:py-24">
        <div className="app-shell">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-primary md:text-4xl">How It Works</h2>
            <p className="page-copy mx-auto text-lg">Freshness, simplified in 3 easy steps.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3 md:gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="surface-card p-6">
                <step.icon className="mx-auto mb-4 h-12 w-12 text-secondary" strokeWidth={1.5} aria-hidden />
                <h3 className="mb-2 text-xl font-bold text-primary">{i + 1}. {step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-secondary py-16 text-center md:py-20">
        <div className="app-shell">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Taste the Difference?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-white/80">
            Join hundreds of families enjoying farm-fresh milk and dairy delivered to their doorstep.
          </p>
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
  )
}

export default Home;
