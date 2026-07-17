import Inventory from '../models/Inventory';
import { IInventoryInput } from '../types';
import { ApiError } from '../utils/apiError';

class InventoryService {
  async getInventory(userId: string, query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { owner: userId };
    if (query.search) {
      filter.$or = [
        { 'foodItem.name': { $regex: query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate('foodItem', 'name category unit')
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(limit),
      Inventory.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async addInventoryItem(userId: string, input: IInventoryInput) {
    const item = await Inventory.create({
      ...input,
      owner: userId,
    });
    return item.populate('foodItem', 'name category unit');
  }

  async updateInventoryItem(userId: string, itemId: string, updates: Partial<IInventoryInput>) {
    const item = await Inventory.findOne({ _id: itemId, owner: userId });
    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    Object.assign(item, updates);
    await item.save();
    return item.populate('foodItem', 'name category unit');
  }

  async deleteInventoryItem(userId: string, itemId: string) {
    const item = await Inventory.findOneAndDelete({ _id: itemId, owner: userId });
    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }
  }

  async logWaste(userId: string, itemId: string, quantity: number, reason: string) {
    const item = await Inventory.findOne({ _id: itemId, owner: userId });
    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    if (quantity > item.currentStock) {
      throw ApiError.badRequest('Waste quantity exceeds current stock');
    }

    item.wasteLog.push({ quantity, reason, date: new Date() });
    item.currentStock -= quantity;
    await item.save();
    return item;
  }

  async getExpiringItems(userId: string, daysAhead: number = 3) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return Inventory.find({
      owner: userId,
      expiryDate: { $lte: futureDate, $gte: new Date() },
      currentStock: { $gt: 0 },
    })
      .populate('foodItem', 'name category')
      .sort({ expiryDate: 1 });
  }

  async getLowStockItems(userId: string) {
    return Inventory.find({
      owner: userId,
      $expr: { $lte: ['$currentStock', '$minimumStock'] },
      currentStock: { $gt: 0 },
    })
      .populate('foodItem', 'name category')
      .sort({ currentStock: 1 });
  }

  async restockItem(userId: string, itemId: string, quantity: number) {
    const item = await Inventory.findOne({ _id: itemId, owner: userId });
    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    item.currentStock += quantity;
    item.lastRestocked = new Date();
    await item.save();
    return item;
  }

  async getWasteAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    const matchFilter: Record<string, unknown> = { owner: userId };

    const pipeline: any[] = [
      { $match: matchFilter },
      { $unwind: '$wasteLog' },
    ];

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      pipeline.push({ $match: { 'wasteLog.date': dateFilter } });
    }

    pipeline.push(
      {
        $group: {
          _id: '$wasteLog.reason',
          totalQuantity: { $sum: '$wasteLog.quantity' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } }
    );

    return Inventory.aggregate(pipeline);
  }
}

export default new InventoryService();
