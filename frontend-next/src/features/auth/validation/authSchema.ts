import { z } from 'zod';
import { UserRole } from '@/types';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
  businessName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
}).refine((data) => {
  if ([UserRole.FoodBusinessOwner, UserRole.NGOPartner].includes(data.role)) {
    return !!data.businessName && data.businessName.length > 2;
  }
  return true;
}, {
  message: 'Business/Organization name is required for this role.',
  path: ['businessName'],
});
export type RegisterInput = z.infer<typeof registerSchema>;
