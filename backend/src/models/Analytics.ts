import mongoose, { Schema } from 'mongoose';
import { IAnalytics } from '../types';

const analyticsMetricsSchema = new Schema(
  {
    totalFoodSaved: { type: Number, default: 0 },
    totalFoodWasted: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    mealsProvided: { type: Number, default: 0 },
    wasteReductionPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const analyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    metrics: {
      type: analyticsMetricsSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

analyticsSchema.index({ userId: 1, period: 1, startDate: -1 });
analyticsSchema.index({ period: 1, startDate: 1, endDate: 1 });

const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);

export default Analytics;
