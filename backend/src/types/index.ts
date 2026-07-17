import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ========================
// Enums
// ========================
export enum UserRole {
  Admin = 'Admin',
  FoodBusinessOwner = 'FoodBusinessOwner',
  NGOPartner = 'NGOPartner',
  Volunteer = 'Volunteer',
  Customer = 'Customer',
}

export enum FoodCategory {
  Produce = 'Produce',
  Dairy = 'Dairy',
  Bakery = 'Bakery',
  Meat = 'Meat',
  Seafood = 'Seafood',
  Prepared = 'Prepared',
  Canned = 'Canned',
  Frozen = 'Frozen',
  Beverages = 'Beverages',
  Other = 'Other',
}

export enum FoodStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Sold = 'Sold',
  Donated = 'Donated',
  Expired = 'Expired',
  Wasted = 'Wasted',
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum DonationStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export enum TaskStatus {
  Open = 'Open',
  Assigned = 'Assigned',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum TaskType {
  Pickup = 'Pickup',
  Delivery = 'Delivery',
  Sorting = 'Sorting',
  Distribution = 'Distribution',
  Other = 'Other',
}

export enum NotificationType {
  OrderUpdate = 'OrderUpdate',
  DonationUpdate = 'DonationUpdate',
  TaskAssignment = 'TaskAssignment',
  ExpiryAlert = 'ExpiryAlert',
  SystemAlert = 'SystemAlert',
  NewListing = 'NewListing',
}

// ========================
// Document Interfaces
// ========================
export interface ITenant extends Document {
  _id: Types.ObjectId;
  name: string;
  type: string;
  subscriptionTier: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  tenantId?: Types.ObjectId;
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  address?: IAddress;
  businessName?: string;
  businessType?: string;
  ngoRegistrationNumber?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  refreshTokens: string[];
  failedLoginAttempts: number;
  lockUntil?: Date;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  fullName: string;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IFoodItem extends Document {
  tenantId: Types.ObjectId;
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  originalPrice: number;
  discountedPrice: number;
  images: string[];
  expiryDate: Date;
  status: FoodStatus;
  owner: Types.ObjectId;
  location: IAddress;
  tags: string[];
  nutritionalInfo?: string;
  allergens: string[];
  isOrganic: boolean;
  isDonatable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends Document {
  tenantId: Types.ObjectId;
  _id: Types.ObjectId;
  orderNumber: string;
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  pickupTime?: Date;
  pickupAddress: IAddress;
  notes?: string;
  cancelReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  foodItem: Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export interface IDonation extends Document {
  tenantId: Types.ObjectId;
  _id: Types.ObjectId;
  donor: Types.ObjectId;
  recipient?: Types.ObjectId;
  foodItems: IDonationItem[];
  status: DonationStatus;
  pickupAddress: IAddress;
  deliveryAddress?: IAddress;
  scheduledPickup?: Date;
  actualPickup?: Date;
  deliveredAt?: Date;
  volunteer?: Types.ObjectId;
  notes?: string;
  impactMetrics?: IImpactMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonationItem {
  foodItem: Types.ObjectId;
  quantity: number;
}

export interface IImpactMetrics {
  mealsProvided: number;
  co2Saved: number;
  waterSaved: number;
}

export interface IVolunteerTask extends Document {
  tenantId: Types.ObjectId;
  _id: Types.ObjectId;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  relatedDonation?: Types.ObjectId;
  location: IAddress;
  scheduledDate: Date;
  completedDate?: Date;
  estimatedDuration: number;
  priority: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventory extends Document {
  tenantId: Types.ObjectId;
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  foodItem: Types.ObjectId;
  currentStock: number;
  minimumStock: number;
  unit: string;
  lastRestocked?: Date;
  expiryDate: Date;
  wasteLog: IWasteEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWasteEntry {
  quantity: number;
  reason: string;
  date: Date;
}

export interface INotification extends Document {
  tenantId: Types.ObjectId;
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalytics extends Document {
  tenantId: Types.ObjectId;
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  period: string;
  startDate: Date;
  endDate: Date;
  metrics: IAnalyticsMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalyticsMetrics {
  totalFoodSaved: number;
  totalFoodWasted: number;
  totalDonations: number;
  totalOrders: number;
  totalRevenue: number;
  co2Saved: number;
  mealsProvided: number;
  wasteReductionPercent: number;
}

// ========================
// Request Types
// ========================
export interface AuthenticatedRequest extends Request {
  user?: ITokenPayload;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

// ========================
// API Response Types
// ========================
export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  pagination?: IPagination;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ========================
// Service Input Types
// ========================
export interface IRegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
  businessType?: string;
  ngoRegistrationNumber?: string;
  address?: IAddress;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IFoodItemInput {
  name: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  originalPrice: number;
  discountedPrice: number;
  expiryDate: string;
  location: IAddress;
  tags?: string[];
  nutritionalInfo?: string;
  allergens?: string[];
  isOrganic?: boolean;
  isDonatable?: boolean;
}

export interface IOrderInput {
  items: Array<{
    foodItem: string;
    quantity: number;
  }>;
  pickupTime?: string;
  notes?: string;
}

export interface IDonationInput {
  foodItems: Array<{
    foodItem: string;
    quantity: number;
  }>;
  pickupAddress: IAddress;
  scheduledPickup?: string;
  notes?: string;
}

export interface ITaskInput {
  title: string;
  description: string;
  type: TaskType;
  relatedDonation?: string;
  location: IAddress;
  scheduledDate: string;
  estimatedDuration: number;
  priority?: number;
  notes?: string;
}

export interface IInventoryInput {
  foodItem: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  expiryDate: string;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
