import { z } from 'zod';
import { UserRole, FoodCategory, FoodStatus, OrderStatus, DonationStatus, TaskStatus, TaskType } from '../types';

// ========================
// Shared Schemas
// ========================
const addressSchema = z.object({
  street: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  zipCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100).default('India'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// ========================
// Auth Validators
// ========================
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase().max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    role: z.nativeEnum(UserRole).default(UserRole.Customer),
    phone: z.string().trim().min(10).max(15).optional(),
    businessName: z.string().trim().max(200).optional(),
    businessType: z.string().trim().max(100).optional(),
    ngoRegistrationNumber: z.string().trim().max(50).optional(),
    address: addressSchema.optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).max(50).optional(),
    lastName: z.string().trim().min(1).max(50).optional(),
    phone: z.string().trim().min(10).max(15).optional(),
    businessName: z.string().trim().max(200).optional(),
    businessType: z.string().trim().max(100).optional(),
    address: addressSchema.optional(),
  }),
});

// ========================
// Food Item Validators
// ========================
export const createFoodItemSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Food name is required').max(200),
    description: z.string().trim().min(1, 'Description is required').max(2000),
    category: z.nativeEnum(FoodCategory),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().trim().min(1).max(20),
    originalPrice: z.number().min(0, 'Price cannot be negative'),
    discountedPrice: z.number().min(0, 'Price cannot be negative'),
    expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    location: addressSchema,
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
    nutritionalInfo: z.string().trim().max(1000).optional(),
    allergens: z.array(z.string().trim().max(50)).max(20).optional(),
    isOrganic: z.boolean().optional(),
    isDonatable: z.boolean().optional(),
  }),
});

export const updateFoodItemSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    category: z.nativeEnum(FoodCategory).optional(),
    quantity: z.number().min(0).optional(),
    unit: z.string().trim().min(1).max(20).optional(),
    originalPrice: z.number().min(0).optional(),
    discountedPrice: z.number().min(0).optional(),
    expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    status: z.nativeEnum(FoodStatus).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
    nutritionalInfo: z.string().trim().max(1000).optional(),
    allergens: z.array(z.string().trim().max(50)).max(20).optional(),
    isOrganic: z.boolean().optional(),
    isDonatable: z.boolean().optional(),
  }),
});

export const foodItemQuerySchema = z.object({
  query: z.object({
    category: z.nativeEnum(FoodCategory).optional(),
    status: z.nativeEnum(FoodStatus).optional(),
    search: z.string().trim().max(200).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    isOrganic: z.coerce.boolean().optional(),
    isDonatable: z.coerce.boolean().optional(),
    ...paginationSchema.shape,
  }),
});

// ========================
// Order Validators
// ========================
export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          foodItem: objectIdSchema,
          quantity: z.number().int().positive('Quantity must be positive'),
        })
      )
      .min(1, 'Order must have at least one item'),
    pickupTime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    notes: z.string().trim().max(500).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
    cancelReason: z.string().trim().max(500).optional(),
  }),
});

export const orderQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    ...paginationSchema.shape,
  }),
});

// ========================
// Donation Validators
// ========================
export const createDonationSchema = z.object({
  body: z.object({
    foodItems: z
      .array(
        z.object({
          foodItem: objectIdSchema,
          quantity: z.number().int().positive('Quantity must be positive'),
        })
      )
      .min(1, 'Donation must have at least one item'),
    pickupAddress: addressSchema,
    scheduledPickup: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
});

export const updateDonationStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(DonationStatus),
    deliveryAddress: addressSchema.optional(),
  }),
});

export const donationQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(DonationStatus).optional(),
    ...paginationSchema.shape,
  }),
});

// ========================
// Volunteer Task Validators
// ========================
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required').max(2000),
    type: z.nativeEnum(TaskType),
    relatedDonation: objectIdSchema.optional(),
    location: addressSchema,
    scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    estimatedDuration: z.number().int().positive('Duration must be positive'),
    priority: z.number().int().min(1).max(5).default(3),
    notes: z.string().trim().max(1000).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    type: z.nativeEnum(TaskType).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    estimatedDuration: z.number().int().positive().optional(),
    priority: z.number().int().min(1).max(5).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(TaskStatus).optional(),
    type: z.nativeEnum(TaskType).optional(),
    ...paginationSchema.shape,
  }),
});

export const assignTaskSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    volunteerId: objectIdSchema,
  }),
});

// ========================
// Inventory Validators
// ========================
export const createInventorySchema = z.object({
  body: z.object({
    foodItem: objectIdSchema,
    currentStock: z.number().min(0, 'Stock cannot be negative'),
    minimumStock: z.number().min(0, 'Minimum stock cannot be negative'),
    unit: z.string().trim().min(1).max(20),
    expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  }),
});

export const updateInventorySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    currentStock: z.number().min(0).optional(),
    minimumStock: z.number().min(0).optional(),
    expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  }),
});

export const logWasteSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    quantity: z.number().positive('Quantity must be positive'),
    reason: z.string().trim().min(1, 'Reason is required').max(500),
  }),
});

export const inventoryQuerySchema = z.object({
  query: z.object({
    lowStock: z.coerce.boolean().optional(),
    expiringSoon: z.coerce.boolean().optional(),
    ...paginationSchema.shape,
  }),
});

// ========================
// Analytics Validators
// ========================
export const analyticsQuerySchema = z.object({
  query: z.object({
    period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  }),
});

// ========================
// AI Proxy Validators
// ========================
export const aiProxySchema = z.object({
  body: z.object({
    prompt: z.string().trim().min(1, 'Prompt is required').max(2000),
    context: z.string().trim().max(5000).optional(),
    type: z.enum(['waste_prediction', 'recipe_suggestion', 'inventory_optimization', 'general']).default('general'),
  }),
});

// ========================
// Admin Validators
// ========================
export const adminUpdateUserSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
  }),
});

export const adminUserQuerySchema = z.object({
  query: z.object({
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.coerce.boolean().optional(),
    search: z.string().trim().max(200).optional(),
    ...paginationSchema.shape,
  }),
});

// ========================
// Param Validators
// ========================
export const idParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Export shared schemas
export { addressSchema, paginationSchema, objectIdSchema };
