import { FoodItem } from '../types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Store, Clock, MapPin } from 'lucide-react';

interface MarketplaceGridProps {
  items: FoodItem[];
  isLoading: boolean;
}

export function MarketplaceGrid({ items, isLoading }: MarketplaceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col space-y-4">
            <div className="bg-muted rounded-xl h-48 w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium">No items found</h3>
        <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => {
        const discount = Math.round((1 - item.discountedPrice / item.originalPrice) * 100);
        
        return (
          <Card key={item._id} className="overflow-hidden flex flex-col group border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 bg-muted overflow-hidden">
              {item.images?.[0] ? (
                <img 
                  src={item.images[0]} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                  <Store className="w-8 h-8 text-secondary/40" />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-danger text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                  {discount}% OFF
                </div>
              )}
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium border border-border">
                {item.quantity} left
              </div>
            </div>
            
            <CardContent className="p-4 flex-1">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-semibold text-lg leading-tight line-clamp-1" title={item.name}>{item.name}</h3>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-bold text-primary text-lg leading-none">{formatCurrency(item.discountedPrice)}</span>
                  {discount > 0 && (
                    <span className="text-xs text-muted-foreground line-through mt-0.5">{formatCurrency(item.originalPrice)}</span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
              
              <div className="space-y-2 mt-auto">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Store className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">{item.owner?.businessName || 'Local Business'}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span>Expires {formatRelativeTime(item.expiryDate)}</span>
                </div>
                {item.distance !== undefined && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>{(item.distance / 1000).toFixed(1)} km away</span>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" variant={item.quantity === 0 ? "secondary" : "default"} disabled={item.quantity === 0}>
                {item.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
