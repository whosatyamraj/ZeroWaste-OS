import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Brain, BarChart3, ShieldCheck, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 glass border-b-0 shadow-sm transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">ZeroWaste OS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
          <a href="#ai" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">AI Engine</a>
          <a href="#impact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Impact</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
          <Button asChild className="hidden sm:flex">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-primary bg-primary/10 mb-6">
            ✨ Introducing AI-Powered Sustainability
          </span>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            End food waste with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Intelligent</span> operations.
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg lg:text-xl text-muted-foreground leading-relaxed"
        >
          ZeroWaste OS empowers restaurants, cloud kitchens, and NGOs to forecast demand, automate dynamic pricing, and seamlessly donate surplus food using advanced Computer Vision and ML.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Button size="lg" asChild className="w-full sm:w-auto h-12 px-8">
            <Link to="/register">Start Free Trial <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8">
            View Live Demo
          </Button>
        </motion.div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to run a zero-waste operation</h2>
        <p className="mt-4 text-lg text-muted-foreground">A unified platform bridging the gap between food businesses, consumers, and NGOs.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: 'Dynamic Marketplace',
            description: 'Automatically discount nearing-expiry items and sell them directly to cost-conscious consumers.',
            icon: Globe2,
          },
          {
            title: 'Automated Donations',
            description: 'Instantly alert local NGO partners when surplus food cannot be sold, arranging seamless pickups.',
            icon: Leaf,
          },
          {
            title: 'Safety Audits',
            description: 'AI computer vision analyzes food quality before listing it for donation to ensure compliance.',
            icon: ShieldCheck,
          },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full border-0 shadow-lg shadow-black/5 bg-background">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const AIEngine = () => (
  <section id="ai" className="py-24 bg-foreground text-background overflow-hidden relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-sm font-medium">
            <Brain className="w-4 h-4" />
            Proprietary ML Models
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Forecasting precision that saves millions.
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Our predictive engine analyzes historical sales, local weather, and seasonal trends to tell you exactly how much food to prepare each day. Say goodbye to over-purchasing.
          </p>
          <ul className="space-y-4">
            {[
              'Demand Forecasting (XGBoost)',
              'Dynamic Pricing Decay Algorithm',
              'Computer Vision Safety Checks',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          {/* Dashboard mockup representation */}
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl p-8 flex flex-col gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
             <div className="h-8 w-1/3 bg-gray-700 rounded-md animate-pulse" />
             <div className="flex-1 w-full bg-gray-800 rounded-lg border border-gray-700 flex items-end p-4 gap-2">
                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                  <motion.div 
                    key={i} 
                    className="flex-1 bg-accent/80 rounded-t-sm" 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                ))}
             </div>
             <div className="h-24 w-full bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-8 h-8 text-accent" />
                  <div>
                    <div className="text-sm text-gray-400">Predicted Demand</div>
                    <div className="text-2xl font-bold text-white">450 portions</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white border-t border-border py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-primary" />
        <span className="font-bold text-lg">ZeroWaste OS</span>
      </div>
      <p className="text-sm text-muted-foreground">© 2026 ZeroWaste OS. All rights reserved.</p>
      <div className="flex gap-6">
        <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</a>
        <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</a>
      </div>
    </div>
  </footer>
);

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      <Hero />
      <Features />
      <AIEngine />
      <Footer />
    </div>
  );
}
