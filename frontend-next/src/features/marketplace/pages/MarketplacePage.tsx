'use client';
import { useState } from 'react';
import { MarketplaceFilters } from '../components/MarketplaceFilters';
import { MarketplaceGrid } from '../components/MarketplaceGrid';
import { useMarketplace } from '../api/useMarketplace';
import { MarketplaceQuery } from '../types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MarketplacePage() {
  const [query, setQuery] = useState<MarketplaceQuery>({
    page: 1,
    limit: 12,
  });

  const { data, isLoading, isError, error } = useMarketplace(query);

  const handleQueryChange = (newQuery: Partial<MarketplaceQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  };

  const handlePageChange = (newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Discover surplus food at discounted prices or find donations near you.
        </p>
      </div>

      <MarketplaceFilters query={query} onQueryChange={handleQueryChange} />

      {isError ? (
        <div className="p-6 rounded-lg bg-danger/10 border border-danger/20 text-danger text-center">
          <p className="font-semibold">Failed to load marketplace data</p>
          <p className="text-sm mt-1">{(error as any)?.message || 'An unexpected error occurred'}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-danger text-danger hover:bg-danger hover:text-white"
            onClick={() => handleQueryChange({})}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <MarketplaceGrid items={data?.items || []} isLoading={isLoading} />
          
          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-border">
              <Button
                variant="outline"
                size="icon"
                disabled={query.page === 1 || isLoading}
                onClick={() => handlePageChange(query.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {query.page} of {data.pagination.pages}
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={query.page === data.pagination.pages || isLoading}
                onClick={() => handlePageChange(query.page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
