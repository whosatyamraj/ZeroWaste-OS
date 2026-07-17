export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  category: 'Produce' | 'Dairy' | 'Bakery' | 'Meat' | 'Prepared' | 'Other';
  expiryDate: string;
  images: string[];
  status: 'Available' | 'Reserved' | 'Sold' | 'Donated' | 'Expired';
  owner: {
    _id: string;
    businessName: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  distance?: number; // Added by geoNear
}

export interface MarketplaceQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface MarketplaceResponse {
  items: FoodItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
