import mongoose, { Schema } from 'mongoose';
import { IVolunteerTask, TaskStatus, TaskType } from '../types';

const volunteerTaskSchema = new Schema<IVolunteerTask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: Object.values(TaskType),
      required: [true, 'Task type is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.Open,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    relatedDonation: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
    },
    location: {
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
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    completedDate: { type: Date },
    estimatedDuration: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    priority: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

volunteerTaskSchema.index({ status: 1, scheduledDate: 1 });
volunteerTaskSchema.index({ assignedTo: 1, status: 1 });
volunteerTaskSchema.index({ type: 1, status: 1 });

const VolunteerTask = mongoose.model<IVolunteerTask>('VolunteerTask', volunteerTaskSchema);

export default VolunteerTask;
