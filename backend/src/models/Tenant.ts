import mongoose, { Schema } from 'mongoose';
import { ITenant } from '../types';

const tenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['FoodBusiness', 'NGO', 'Enterprise'],
      required: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['Free', 'Pro', 'Enterprise'],
      default: 'Free',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);

export default Tenant;
