export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
  expiryDate: string;
  status: 'Available' | 'Reserved' | 'Sold' | 'Donated' | 'Expired';
  createdAt: string;
}

export interface InventoryQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface InventoryResponse {
  items: InventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
