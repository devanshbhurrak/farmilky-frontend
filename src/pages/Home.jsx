import { ArrowRight, ChevronRight, Droplets, Leaf, Milk, Tractor, Truck, UserCheck } from "lucide-react"
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import Features from '../components/Features'
import useDocumentTitle from '../hooks/useDocumentTitle'

const stats = [
  { value: "10+", label: "Partner Farms" },
  { value: "50K+", label: "Litres Delivered" },
  { value: "30+", label: "Dairy Products" },
  { value: "7+", label: "Years of Trust" },
]

const howItWorks = [
  {
    icon: UserCheck,
    step: "01",
    title: "Place Your Order",
    desc: "Choose your products and set a delivery schedule that works for you — daily, alternate days, or custom.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Tractor,
    step: "02",
    title: "We Source & Pack",
    desc: "Freshly milked and packed within hours before delivery to ensure peak freshness and nutrition.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Truck,
    step: "03",
    title: "Delivered Fresh",
    desc: "Wake up to farm-fresh goodness at your doorstep every single morning, before you start your day.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
]

const products = [
  { name: "Fresh Cow Milk", price: "₹64/L", tag: "Best Seller", icon: Milk, accent: "from-green-50 to-emerald-50 border-green-100", iconColor: "text-emerald-600", tagColor: "bg-emerald-50 text-emerald-700" },
  { name: "Buffalo Milk", price: "₹72/L", tag: "Premium", icon: Droplets, accent: "from-blue-50 to-sky-50 border-blue-100", iconColor: "text-blue-600", tagColor: "bg-blue-50 text-blue-700" },
  { name: "Pure Ghee", price: "₹550/kg", tag: "Traditional", icon: Leaf, accent: "from-amber-50 to-yellow-50 border-amber-100", iconColor: "text-amber-600", tagColor: "bg-amber-50 text-amber-700" },
  { name: "Fresh Paneer", price: "₹320/kg", tag: "Popular", icon: Tractor, accent: "from-rose-50 to-pink-50 border-rose-100", iconColor: "text-rose-600", tagColor: "bg-rose-50 text-rose-700" },
]

const Home = () => {
  useDocumentTitle("")

  return (
    <>
      <Hero />
      <Features />

      {/* ── Stats ── */}
      <section className="relative overflow-hidden bg-primary py-12 md:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/[0.03] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/[0.08] blur-3xl" />
        </div>
        <div className="app-shell relative">
          <div className="grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`flex flex-col items-center justify-center px-4 py-2 text-center ${i > 0 ? "" : ""}`}>
                <p className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-white/50 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-background py-16 md:py-28">
        <div className="app-shell">
          <div className="mb-12 text-center md:mb-18">
            <span className="page-kicker">Simple Process</span>
            <h2 className="page-title mt-3 mb-4">How It Works</h2>
            <p className="page-copy mx-auto">From farm to your doorstep — freshness simplified in 3 steps.</p>
          </div>

          <div className="relative grid grid-cols-1 gap-px md:grid-cols-3">
            {/* Desktop connector line */}
            <div
              className="pointer-events-none absolute top-[3.25rem] left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] hidden h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent md:block"
              aria-hidden
            />

            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative flex gap-5 rounded-2xl p-6 md:flex-col md:items-center md:gap-0 md:p-8 md:text-center">
                  {/* Mobile vertical connector */}
                  {i < howItWorks.length - 1 && (
                    <div className="absolute top-[4.5rem] bottom-0 left-[2.85rem] w-px bg-gradient-to-b from-gray-200 to-transparent md:hidden" aria-hidden />
                  )}

                  <div className="relative shrink-0 md:mx-auto md:mb-6">
                    <div className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl ${step.bg}`}>
                      <Icon className={`h-6 w-6 ${step.color}`} strokeWidth={1.75} aria-hidden />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-white">
                      {i + 1}
                    </span>
                  </div>

                  <div className="pt-1 md:pt-0">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 md:mb-1">{step.step}</p>
                    <h3 className="mb-2 text-base font-bold text-primary md:text-lg">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500 md:mx-auto md:max-w-[220px]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section className="relative overflow-hidden bg-white py-16 md:py-28">
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/[0.04] blur-3xl" aria-hidden />
        <div className="app-shell relative">
          <div className="mb-12 text-center md:mb-16">
            <span className="page-kicker">Our Products</span>
            <h2 className="page-title mt-3 mb-4">Farm-Fresh Range</h2>
            <p className="page-copy mx-auto">Pure dairy goodness, straight from our farm to your table.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4 md:gap-6">
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.name}
                  className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 ${product.accent}`}
                >
                  <span className={`mb-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:mb-4 ${product.tagColor}`}>
                    {product.tag}
                  </span>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${product.iconColor}`} strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="mb-1 text-xs font-bold text-primary sm:text-sm md:text-base">{product.name}</h3>
                  <p className="text-base font-extrabold text-secondary sm:text-lg">{product.price}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/order"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
            >
              View Full Menu
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-orange-400 py-16 text-center md:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute top-0 left-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="app-shell relative">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60 sm:text-sm">
            Start Today
          </p>
          <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Ready to Taste the Difference?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-sm text-white/80 md:text-base lg:text-lg">
            Join hundreds of families enjoying farm-fresh milk and dairy
            products delivered to their doorstep every morning.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/order"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 font-bold text-secondary shadow-xl shadow-black/10 transition-all duration-300 hover:bg-white/95 hover:shadow-2xl active:scale-[0.97] sm:w-auto"
            >
              Start Your Order
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              to="/contact"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-white/30 px-8 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-white/10 sm:w-auto"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
