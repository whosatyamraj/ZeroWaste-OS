import { motion } from 'framer-motion';
import { Store, Search, MapPin, Clock, Star, ShoppingCart, Filter } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const categories = ['All', 'Produce', 'Dairy', 'Bakery', 'Prepared', 'Meat', 'Beverages', 'Frozen'];

const listings = [
  { id: '1', title: 'Organic Mixed Salad Pack', category: 'Produce', originalPrice: 12.99, price: 5.99, quantity: 25, unit: 'packs', expiresIn: '18 hours', seller: 'GreenBites Kitchen', rating: 4.8, distance: '0.8 km', image: '🥗', discount: 54 },
  { id: '2', title: 'Artisan Sourdough Bread', category: 'Bakery', originalPrice: 8.50, price: 3.50, quantity: 15, unit: 'loaves', expiresIn: '12 hours', seller: 'Urban Crust Bakery', rating: 4.9, distance: '1.2 km', image: '🍞', discount: 59 },
  { id: '3', title: 'Greek Yogurt Tubs (500ml)', category: 'Dairy', originalPrice: 6.99, price: 2.99, quantity: 30, unit: 'tubs', expiresIn: '2 days', seller: 'Fresh Valley Farm', rating: 4.7, distance: '2.1 km', image: '🥛', discount: 57 },
  { id: '4', title: 'Grilled Chicken Bowls', category: 'Prepared', originalPrice: 15.99, price: 7.99, quantity: 10, unit: 'bowls', expiresIn: '6 hours', seller: 'The Spice House', rating: 4.6, distance: '0.5 km', image: '🍗', discount: 50 },
  { id: '5', title: 'Mixed Berry Smoothie Pack', category: 'Beverages', originalPrice: 9.99, price: 4.49, quantity: 20, unit: 'bottles', expiresIn: '1 day', seller: 'JuiceLab', rating: 4.8, distance: '1.8 km', image: '🫐', discount: 55 },
  { id: '6', title: 'Farm-Fresh Egg Cartons', category: 'Produce', originalPrice: 7.99, price: 3.99, quantity: 40, unit: 'dozens', expiresIn: '5 days', seller: 'Sunrise Farms', rating: 4.5, distance: '3.2 km', image: '🥚', discount: 50 },
  { id: '7', title: 'Paneer Tikka Platter', category: 'Prepared', originalPrice: 18.99, price: 8.99, quantity: 8, unit: 'platters', expiresIn: '4 hours', seller: 'Spice Route', rating: 4.9, distance: '0.3 km', image: '🧀', discount: 53 },
  { id: '8', title: 'Frozen Veggie Dumplings', category: 'Frozen', originalPrice: 11.99, price: 5.49, quantity: 35, unit: 'packs', expiresIn: '30 days', seller: 'Dim Sum Palace', rating: 4.7, distance: '2.5 km', image: '🥟', discount: 54 },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = listings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Surplus Marketplace</h1>
              <p className="text-sm text-muted-foreground">Quality food at great prices. Save money, save the planet.</p>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div className="flex flex-col sm:flex-row gap-4 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search surplus food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-surface-1 border-border rounded-xl"
            />
          </div>
          <Button variant="outline" className="border-border rounded-xl gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </motion.div>

        {/* Category Tabs */}
        <motion.div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'bg-surface-2 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className="glass-card overflow-hidden group hover:border-accent/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="h-40 bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center text-6xl relative">
                {item.image}
                <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0 text-xs font-bold">
                  -{item.discount}%
                </Badge>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.seller}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3 h-3 fill-current" /> {item.rating}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.distance}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.expiresIn}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">${item.price}</span>
                    <span className="text-xs text-muted-foreground line-through">${item.originalPrice}</span>
                  </div>
                  <Button size="sm" className="bg-accent text-white hover:bg-accent/90 rounded-lg h-8 px-3 text-xs">
                    <ShoppingCart className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-2">{item.quantity} {item.unit} available</p>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No items found matching your criteria.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
