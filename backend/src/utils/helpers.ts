import crypto from 'crypto';
import { IPagination } from '../types';

export const generateToken = (length = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ZW-${timestamp}-${random}`;
};

export const buildPagination = (
  page: number,
  limit: number,
  total: number
): IPagination => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const sanitizeUser = (user: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.refreshTokens;
  delete sanitized.emailVerificationToken;
  delete sanitized.emailVerificationExpiry;
  delete sanitized.passwordResetToken;
  delete sanitized.passwordResetExpiry;
  delete sanitized.failedLoginAttempts;
  delete sanitized.lockUntil;
  delete sanitized.__v;
  return sanitized;
};

export const calculateCO2Saved = (foodWeightKg: number): number => {
  // Average CO2 per kg of food waste is ~2.5 kg CO2e
  return Math.round(foodWeightKg * 2.5 * 100) / 100;
};

export const calculateMealsProvided = (foodWeightKg: number): number => {
  // Average meal is ~0.5 kg of food
  return Math.floor(foodWeightKg / 0.5);
};

export const calculateWaterSaved = (foodWeightKg: number): number => {
  // Average water footprint per kg of food is ~1000 liters
  return Math.round(foodWeightKg * 1000);
};

export const isExpired = (date: Date): boolean => {
  return new Date(date) < new Date();
};

export const getExpiryInHours = (date: Date): number => {
  const now = new Date();
  const expiry = new Date(date);
  return Math.max(0, Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60)));
};
