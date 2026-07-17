export enum UserRole {
  Admin = 'Admin',
  FoodBusinessOwner = 'FoodBusinessOwner',
  KitchenManager = 'KitchenManager',
  NGOPartner = 'NGOPartner',
  Volunteer = 'Volunteer',
  Consumer = 'Consumer',
  Customer = 'Customer'
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organization?: string;
  tenantId?: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken?: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organization?: string;
}

export interface DashboardStats {
  totalWasteSaved: number;
  mealsRedirected: number;
  co2Reduced: number;
  activeDonors: number;
  activeNGOs: number;
  volunteers: number;
  revenue: number;
  costSavings: number;
}

export interface WasteEntry {
  id: string;
  category: string;
  weight: number;
  unit: string;
  source: string;
  date: string;
  status: 'logged' | 'processing' | 'composted' | 'donated' | 'recycled';
  notes?: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  quantity: number;
  unit: string;
  expiresAt: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  images: string[];
  location: string;
  distance?: number;
  tags: string[];
  status: 'available' | 'reserved' | 'sold' | 'expired';
  createdAt: string;
}

export interface Donation {
  id: string;
  donor: string;
  ngo: string;
  items: DonationItem[];
  status: 'pending' | 'accepted' | 'in-transit' | 'delivered' | 'completed';
  pickupAddress: string;
  deliveryAddress: string;
  scheduledAt: string;
  completedAt?: string;
  volunteer?: string;
}

export interface DonationItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface KitchenData {
  temperature: number;
  humidity: number;
  wasteLevel: number;
  activeAlerts: number;
  equipmentStatus: EquipmentStatus[];
  zones: KitchenZone[];
}

export interface EquipmentStatus {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'warning' | 'offline' | 'maintenance';
  temperature?: number;
  lastChecked: string;
}

export interface KitchenZone {
  id: string;
  name: string;
  wasteLevel: number;
  capacity: number;
  lastEmptied: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  expiresAt: string;
  supplier: string;
  costPerUnit: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring-soon';
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'prediction' | 'recommendation' | 'alert' | 'optimization';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  action?: string;
  metric?: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
  createdAt: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  category?: string;
}

export interface SustainabilityMetric {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  icon: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
