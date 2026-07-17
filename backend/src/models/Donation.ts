import mongoose, { Schema } from 'mongoose';
import { IDonation, DonationStatus } from '../types';

const donationItemSchema = new Schema(
  {
    foodItem: {
      type: Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false }
);

const donationSchema = new Schema<IDonation>(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    foodItems: {
      type: [donationItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: 'Donation must have at least one item',
      },
    },
    status: {
      type: String,
      enum: Object.values(DonationStatus),
      default: DonationStatus.Pending,
      index: true,
    },
    pickupAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    deliveryAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    scheduledPickup: { type: Date },
    actualPickup: { type: Date },
    deliveredAt: { type: Date },
    volunteer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    impactMetrics: {
      mealsProvided: { type: Number, default: 0 },
      co2Saved: { type: Number, default: 0 },
      waterSaved: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ recipient: 1, status: 1 });
donationSchema.index({ volunteer: 1, status: 1 });
donationSchema.index({ createdAt: -1 });

const Donation = mongoose.model<IDonation>('Donation', donationSchema);

export default Donation;
