import mongoose, { Schema } from 'mongoose';
import { IInventory } from '../types';

const wasteEntrySchema = new Schema(
  {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const inventorySchema = new Schema<IInventory>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    foodItem: {
      type: Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
      index: true,
    },
    currentStock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
    },
    minimumStock: {
      type: Number,
      required: true,
      min: [0, 'Minimum stock cannot be negative'],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    lastRestocked: { type: Date },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    wasteLog: {
      type: [wasteEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inventorySchema.index({ owner: 1, expiryDate: 1 });
inventorySchema.index({ currentStock: 1, minimumStock: 1 });

const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);

export default Inventory;
