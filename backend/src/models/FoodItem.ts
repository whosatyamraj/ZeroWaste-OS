import mongoose, { Schema } from 'mongoose';
import { IFoodItem, FoodCategory, FoodStatus } from '../types';

const foodItemSchema = new Schema<IFoodItem>(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: 200,
      index: 'text',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: Object.values(FoodCategory),
      required: [true, 'Category is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Discounted price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(FoodStatus),
      default: FoodStatus.Available,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    tags: { type: [String], default: [] },
    nutritionalInfo: { type: String, trim: true },
    allergens: { type: [String], default: [] },
    isOrganic: { type: Boolean, default: false },
    isDonatable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

foodItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
foodItemSchema.index({ status: 1, expiryDate: 1 });
foodItemSchema.index({ owner: 1, status: 1 });
foodItemSchema.index({ category: 1, status: 1 });

const FoodItem = mongoose.model<IFoodItem>('FoodItem', foodItemSchema);

export default FoodItem;
