import FoodItem from '../models/FoodItem';
import { IFoodItem, IFoodItemInput, FoodStatus, IPaginationQuery } from '../types';
import { ApiError } from '../utils/apiError';
import { buildPagination } from '../utils/helpers';
import logger from '../utils/logger';

class FoodService {
  async createFoodItem(
    ownerId: string,
    input: IFoodItemInput
  ): Promise<IFoodItem> {
    const foodItem = await FoodItem.create({
      ...input,
      expiryDate: new Date(input.expiryDate),
      owner: ownerId,
    });

    logger.info(`Food item created: ${foodItem._id} by user ${ownerId}`);
    return foodItem;
  }

  async getFoodItems(
    query: IPaginationQuery & {
      category?: string;
      status?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      isOrganic?: boolean;
      isDonatable?: boolean;
    }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};

    if (query.category) filter.category = query.category;
    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = FoodStatus.Available;
    }
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.discountedPrice = {};
      if (query.minPrice !== undefined) {
        (filter.discountedPrice as Record<string, number>).$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        (filter.discountedPrice as Record<string, number>).$lte = query.maxPrice;
      }
    }
    if (query.isOrganic !== undefined) filter.isOrganic = query.isOrganic;
    if (query.isDonatable !== undefined) filter.isDonatable = query.isDonatable;

    const [items, total] = await Promise.all([
      FoodItem.find(filter)
        .populate('owner', 'firstName lastName businessName avatar')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      FoodItem.countDocuments(filter),
    ]);

    return {
      items,
      pagination: buildPagination(page, limit, total),
    };
  }

  async getFoodItemById(id: string): Promise<IFoodItem> {
    const foodItem = await FoodItem.findById(id)
      .populate('owner', 'firstName lastName businessName avatar email phone');

    if (!foodItem) {
      throw ApiError.notFound('Food item not found');
    }

    return foodItem;
  }

  async getMyFoodItems(ownerId: string, query: IPaginationQuery & { status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { owner: ownerId };
    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
      FoodItem.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FoodItem.countDocuments(filter),
    ]);

    return {
      items,
      pagination: buildPagination(page, limit, total),
    };
  }

  async updateFoodItem(
    ownerId: string,
    id: string,
    updates: Partial<IFoodItemInput> & { status?: FoodStatus }
  ): Promise<IFoodItem> {
    const foodItem = await FoodItem.findById(id);

    if (!foodItem) {
      throw ApiError.notFound('Food item not found');
    }

    if (foodItem.owner.toString() !== ownerId) {
      throw ApiError.forbidden('You can only update your own food items');
    }

    const updateData: Record<string, unknown> = { ...updates };
    if (updates.expiryDate) {
      updateData.expiryDate = new Date(updates.expiryDate);
    }

    const updated = await FoodItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw ApiError.notFound('Food item not found');
    }

    logger.info(`Food item updated: ${id} by user ${ownerId}`);
    return updated;
  }

  async deleteFoodItem(ownerId: string, id: string): Promise<void> {
    const foodItem = await FoodItem.findById(id);

    if (!foodItem) {
      throw ApiError.notFound('Food item not found');
    }

    if (foodItem.owner.toString() !== ownerId) {
      throw ApiError.forbidden('You can only delete your own food items');
    }

    await FoodItem.findByIdAndDelete(id);
    logger.info(`Food item deleted: ${id} by user ${ownerId}`);
  }

  async getUserListings(ownerId: string, query: IPaginationQuery & { status?: string }) {
    return this.getMyFoodItems(ownerId, query);
  }

  async addImages(id: string, ownerId: string, imageUrls: string[]): Promise<IFoodItem> {
    const foodItem = await FoodItem.findById(id);

    if (!foodItem) {
      throw ApiError.notFound('Food item not found');
    }

    if (foodItem.owner.toString() !== ownerId) {
      throw ApiError.forbidden('You can only update your own food items');
    }

    const updated = await FoodItem.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );

    if (!updated) {
      throw ApiError.notFound('Food item not found');
    }

    return updated;
  }

  async getExpiringItems(hoursThreshold = 24) {
    const thresholdDate = new Date(Date.now() + hoursThreshold * 60 * 60 * 1000);

    return FoodItem.find({
      status: FoodStatus.Available,
      expiryDate: { $lte: thresholdDate, $gte: new Date() },
    })
      .populate('owner', 'firstName lastName businessName email')
      .sort({ expiryDate: 1 })
      .lean();
  }

  async checkExpiredFoods() {
    const now = new Date();
    
    // Find all available items whose expiry date has passed
    const result = await FoodItem.updateMany(
      {
        status: FoodStatus.Available,
        expiryDate: { $lte: now },
      },
      {
        $set: { status: FoodStatus.Expired },
      }
    );
    
    if (result.modifiedCount > 0) {
      logger.info(`Cron: Marked ${result.modifiedCount} food items as Expired.`);
    }
  }
}

export default new FoodService();
