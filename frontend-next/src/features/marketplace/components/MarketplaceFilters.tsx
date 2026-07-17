import { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MarketplaceQuery } from '../types';

interface MarketplaceFiltersProps {
  query: MarketplaceQuery;
  onQueryChange: (newQuery: Partial<MarketplaceQuery>) => void;
}

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Meat', 'Prepared', 'Other'];

export function MarketplaceFilters({ query, onQueryChange }: MarketplaceFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(query.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== query.search) {
        onQueryChange({ search: searchTerm, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, query.search, onQueryChange]);

  const handleCategoryChange = (cat: string) => {
    onQueryChange({ category: cat === 'All' ? undefined : cat, page: 1 });
  };

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onQueryChange({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude,
            page: 1 
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please check permissions.");
        }
      );
    }
  };

  const clearLocation = () => {
    onQueryChange({ lat: undefined, lng: undefined, page: 1 });
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Search and Top Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search surplus food..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 rounded-lg border-border"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {query.lat && query.lng ? (
            <Button variant="outline" className="h-11 shrink-0 border-primary text-primary" onClick={clearLocation}>
              <MapPin className="w-4 h-4 mr-2" />
              Near You
              <X className="w-3 h-3 ml-2" />
            </Button>
          ) : (
            <Button variant="outline" className="h-11 shrink-0" onClick={handleLocationRequest}>
              <MapPin className="w-4 h-4 mr-2" />
              Find Near Me
            </Button>
          )}
          
          <Button 
            variant={showFilters ? 'secondary' : 'outline'} 
            className="h-11 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      {/* Expandable Filter Area */}
      {showFilters && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border animate-in slide-in-from-top-2 fade-in-0 duration-200">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const isSelected = cat === 'All' ? !query.category : query.category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-background border border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
