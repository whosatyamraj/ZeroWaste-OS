import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf, BarChart3, Brain, Shield, ChefHat, Store, Heart,
  HandHelping, Zap, ArrowRight, CheckCircle2, Star,
  TrendingDown, Utensils, Recycle, Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stats = [
  { value: '2.5B', label: 'Tons of food wasted yearly', icon: TrendingDown },
  { value: '$1.2T', label: 'Economic loss globally', icon: Globe2 },
  { value: '8-10%', label: 'Of global CO₂ emissions', icon: Recycle },
  { value: '690M', label: 'People go hungry daily', icon: Utensils },
];

const features = [
  { icon: Brain, title: 'AI Demand Forecasting', description: 'Predict future food demand using historical data, weather, holidays, and events. Reduce overproduction by up to 40%.', color: 'from-violet-500 to-purple-500' },
  { icon: ChefHat, title: 'Kitchen Intelligence', description: 'Real-time monitoring of orders, inventory, and production with Socket.io-powered live updates.', color: 'from-orange-500 to-red-500' },
  { icon: Shield, title: 'Food Safety AI', description: 'Computer vision analysis classifies food as Safe, Consume Soon, or Unsafe with confidence scores.', color: 'from-emerald-500 to-teal-500' },
  { icon: Zap, title: 'AI Decision Engine', description: 'Autonomously determines the best action for surplus: discount sale, donate, repurpose, or compost.', color: 'from-blue-500 to-cyan-500' },
  { icon: Store, title: 'Smart Marketplace', description: 'Sell surplus food at discounted prices with search, filters, geolocation, cart, and checkout.', color: 'from-pink-500 to-rose-500' },
  { icon: Heart, title: 'NGO Redistribution', description: 'NGOs browse donations, schedule pickups, and track deliveries — connecting food to those who need it.', color: 'from-amber-500 to-yellow-500' },
];

const pricingPlans = [
  { name: 'Starter', price: 49, period: '/mo', features: ['Up to 1 location', 'Basic analytics', 'Marketplace access', 'Email support', 'Up to 5 users'], cta: 'Start Free Trial', highlighted: false },
  { name: 'Professional', price: 149, period: '/mo', features: ['Up to 10 locations', 'AI demand forecasting', 'Food safety analysis', 'Priority support', 'Unlimited users', 'API access'], cta: 'Start Free Trial', highlighted: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited locations', 'Full AI suite', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'On-premise option'], cta: 'Contact Sales', highlighted: false },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Head Chef', company: 'The Grand Kitchen', content: 'ZeroWaste OS reduced our food waste by 38% in the first quarter. The AI predictions are remarkably accurate.', rating: 5 },
  { name: 'Rajesh Patel', role: 'Operations Director', company: 'FreshBites Hotels', content: 'The real-time kitchen intelligence dashboard transformed how we manage our 15 outlets. Game-changing platform.', rating: 5 },
  { name: 'Maria Lopez', role: 'NGO Coordinator', company: 'FeedForward Foundation', content: 'We now receive perfectly-timed surplus food from 200+ restaurants. The logistics module is incredible.', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" /> AI-Powered Food Waste Intelligence
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            <span className="text-foreground">Eliminate Food Waste</span>
            <br />
            <span className="gradient-text">With Intelligence</span>
          </motion.h1>

          <motion.p
            className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10"
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            The autonomous AI operating system that prevents, optimizes, and manages food waste across the entire lifecycle — from preparation to final disposal.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 px-8 h-12 text-base rounded-xl">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-surface-2 px-8 h-12 text-base rounded-xl">
                View Features
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-4xl mx-auto"
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center glow-accent-hover transition-all duration-300">
                <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Features</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Everything You Need to <span className="gradient-text">Fight Food Waste</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Six powerful AI modules working together to transform how your food business operates.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6 hover:border-accent/30 transition-all duration-300 group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-surface-1/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">How It Works</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mt-3">
              Simple. <span className="gradient-text">Intelligent.</span> Effective.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Connect', desc: 'Link your kitchen operations, POS systems, and inventory to ZeroWaste OS.' },
              { step: '02', title: 'Analyze', desc: 'Our AI models analyze patterns, predict demand, and assess food safety in real-time.' },
              { step: '03', title: 'Act', desc: 'Receive automated decisions — discount, donate, repurpose, or compost — maximizing value.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold gradient-text">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-foreground mt-3">Trusted by <span className="gradient-text">Industry Leaders</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-surface-1/50 relative" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Pricing</span>
            <h2 className="text-4xl font-bold text-foreground mt-3">Plans for <span className="gradient-text">Every Scale</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`glass-card p-6 flex flex-col ${plan.highlighted ? 'border-accent/40 glow-accent relative' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-foreground">{typeof plan.price === 'number' ? `$${plan.price}` : plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={plan.highlighted
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 w-full rounded-xl'
                    : 'border-border text-foreground hover:bg-surface-2 w-full rounded-xl'}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="glass-card p-12 glow-accent"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Leaf className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to <span className="gradient-text">Eliminate Waste?</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join hundreds of food businesses already saving thousands in costs while making a real environmental impact.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 h-12 text-base rounded-xl shadow-lg shadow-emerald-500/25">
                Get Started Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
