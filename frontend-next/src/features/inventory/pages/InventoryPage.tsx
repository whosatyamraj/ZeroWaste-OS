'use client';
import { useState, useEffect } from 'react';
import { InventoryTable } from '../components/InventoryTable';
import { useInventory } from '../api/useInventory';
import { InventoryQuery } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export function InventoryPage() {
  const [query, setQuery] = useState<InventoryQuery>({
    page: 1,
    limit: 10,
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== query.search) {
        setQuery(prev => ({ ...prev, search: searchTerm, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, query.search]);

  const { data, isLoading, isError, error } = useInventory(query);

  const handlePageChange = (newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your food stock, track expiry dates, and automate pricing.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search inventory by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 border-border"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={query.status || ''}
            onChange={(e) => setQuery(prev => ({ ...prev, status: e.target.value || undefined, page: 1 }))}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Donated">Donated</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {isError ? (
        <div className="p-6 rounded-lg bg-danger/10 border border-danger/20 text-danger text-center">
          <p className="font-semibold">Failed to load inventory</p>
          <p className="text-sm mt-1">{(error as any)?.message || 'An unexpected error occurred'}</p>
        </div>
      ) : (
        <>
          <InventoryTable items={data?.items || []} isLoading={isLoading} />
          
          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(query.page - 1) * query.limit + 1}</span> to <span className="font-medium">{Math.min(query.page * query.limit, data.pagination.total)}</span> of <span className="font-medium">{data.pagination.total}</span> results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={query.page === 1 || isLoading}
                  onClick={() => handlePageChange(query.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <div className="text-sm font-medium px-4">
                  {query.page} / {data.pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={query.page === data.pagination.pages || isLoading}
                  onClick={() => handlePageChange(query.page + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
