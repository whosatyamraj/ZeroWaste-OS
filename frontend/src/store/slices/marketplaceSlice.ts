import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MarketplaceItem } from '@/types';

interface MarketplaceState {
  items: MarketplaceItem[];
  filteredItems: MarketplaceItem[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  isLoading: boolean;
}

const initialState: MarketplaceState = {
  items: [],
  filteredItems: [],
  searchQuery: '',
  selectedCategory: 'all',
  sortBy: 'newest',
  isLoading: false,
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<MarketplaceItem[]>) {
      state.items = action.payload;
      state.filteredItems = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setItems, setSearchQuery, setSelectedCategory, setSortBy, setLoading } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
