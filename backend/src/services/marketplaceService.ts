import Order from '../models/Order';
import FoodItem from '../models/FoodItem';
import { IOrder, IOrderInput, OrderStatus, FoodStatus, IPaginationQuery } from '../types';
import { ApiError } from '../utils/apiError';
import { generateOrderNumber, buildPagination } from '../utils/helpers';
import logger from '../utils/logger';

class MarketplaceService {
  async createOrder(buyerId: string, input: IOrderInput): Promise<IOrder> {
    let totalAmount = 0;
    const orderItems = [];
    let sellerId: string | null = null;

    for (const item of input.items) {
      const foodItem = await FoodItem.findById(item.foodItem);

      if (!foodItem) {
        throw ApiError.notFound(`Food item ${item.foodItem} not found`);
      }

      if (foodItem.status !== FoodStatus.Available) {
        throw ApiError.badRequest(`Food item "${foodItem.name}" is no longer available`);
      }

      if (item.quantity > foodItem.quantity) {
        throw ApiError.badRequest(
          `Requested quantity for "${foodItem.name}" exceeds available stock (${foodItem.quantity} available)`
        );
      }

      if (foodItem.owner.toString() === buyerId) {
        throw ApiError.badRequest('You cannot purchase your own items');
      }

      // All items in one order must belong to the same seller
      if (!sellerId) {
        sellerId = foodItem.owner.toString();
      } else if (sellerId !== foodItem.owner.toString()) {
        throw ApiError.badRequest('All items in an order must be from the same seller');
      }

      orderItems.push({
        foodItem: foodItem._id,
        quantity: item.quantity,
        priceAtPurchase: foodItem.discountedPrice,
      });

      totalAmount += foodItem.discountedPrice * item.quantity;
    }

    if (!sellerId) {
      throw ApiError.badRequest('No valid items in order');
    }

    // Get the seller's food item location for pickup
    const firstFoodItem = await FoodItem.findById(input.items[0].foodItem);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      buyer: buyerId,
      seller: sellerId,
      items: orderItems,
      totalAmount,
      pickupTime: input.pickupTime ? new Date(input.pickupTime) : undefined,
      pickupAddress: firstFoodItem?.location || {},
      notes: input.notes,
    });

    // Reserve the items
    for (const item of input.items) {
      await FoodItem.findByIdAndUpdate(item.foodItem, {
        $inc: { quantity: -item.quantity },
      });

      const updatedItem = await FoodItem.findById(item.foodItem);
      if (updatedItem && updatedItem.quantity <= 0) {
        await FoodItem.findByIdAndUpdate(item.foodItem, {
          status: FoodStatus.Reserved,
        });
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'firstName lastName email phone')
      .populate('seller', 'firstName lastName businessName email phone')
      .populate('items.foodItem', 'name category images');

    if (!populatedOrder) {
      throw ApiError.internal();
    }

    logger.info(`Order created: ${order.orderNumber} by buyer ${buyerId}`);
    return populatedOrder;
  }

  async getOrders(
    userId: string,
    role: 'buyer' | 'seller',
    query: IPaginationQuery & { status?: string }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      [role]: userId,
    };
    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('buyer', 'firstName lastName email')
        .populate('seller', 'firstName lastName businessName')
        .populate('items.foodItem', 'name category images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: buildPagination(page, limit, total),
    };
  }

  async getOrderById(orderId: string, userId: string): Promise<IOrder> {
    const order = await Order.findById(orderId)
      .populate('buyer', 'firstName lastName email phone')
      .populate('seller', 'firstName lastName businessName email phone')
      .populate('items.foodItem', 'name category images discountedPrice');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Only buyer, seller, or admin can view
    if (
      order.buyer._id.toString() !== userId &&
      order.seller._id.toString() !== userId
    ) {
      throw ApiError.forbidden('You do not have access to this order');
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
    cancelReason?: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, OrderStatus[]> = {
      [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
      [OrderStatus.Confirmed]: [OrderStatus.InProgress, OrderStatus.Cancelled],
      [OrderStatus.InProgress]: [OrderStatus.Completed, OrderStatus.Cancelled],
    };

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(status)) {
      throw ApiError.badRequest(
        `Cannot transition from '${order.status}' to '${status}'`
      );
    }

    // Only seller can confirm/complete; buyer or seller can cancel
    if (status === OrderStatus.Cancelled) {
      if (
        order.buyer.toString() !== userId &&
        order.seller.toString() !== userId
      ) {
        throw ApiError.forbidden('You do not have permission to cancel this order');
      }
    } else {
      if (order.seller.toString() !== userId) {
        throw ApiError.forbidden('Only the seller can update order status');
      }
    }

    const updateData: Record<string, unknown> = { status };

    if (status === OrderStatus.Completed) {
      updateData.completedAt = new Date();
      // Mark food items as sold
      for (const item of order.items) {
        await FoodItem.findByIdAndUpdate(item.foodItem, {
          status: FoodStatus.Sold,
        });
      }
    }

    if (status === OrderStatus.Cancelled) {
      updateData.cancelReason = cancelReason;
      // Restore food item quantities
      for (const item of order.items) {
        await FoodItem.findByIdAndUpdate(item.foodItem, {
          $inc: { quantity: item.quantity },
          status: FoodStatus.Available,
        });
      }
    }

    const updated = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    })
      .populate('buyer', 'firstName lastName email')
      .populate('seller', 'firstName lastName businessName')
      .populate('items.foodItem', 'name category');

    if (!updated) {
      throw ApiError.notFound('Order not found');
    }

    logger.info(`Order ${order.orderNumber} status updated to ${status}`);
    return updated;
  }

  async browseListings(query: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [];

    // 1. Optional GeoNear Stage (must be the first stage in pipeline)
    if (query.lat && query.lng) {
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(query.lng), parseFloat(query.lat)] },
          distanceField: 'distance',
          maxDistance: query.radius ? parseFloat(query.radius) : 10000,
          spherical: true,
        }
      });
    }

    // 2. Match filters
    const matchStage: any = {
      status: FoodStatus.Available,
      quantity: { $gt: 0 }
    };
    if (query.category) matchStage.category = query.category;
    
    // Standard MongoDB Regex Search (compatible with Compass/Local MongoDB)
    if (query.search) {
      matchStage.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    pipeline.push({ $match: matchStage });

    // 3. Sort
    if (!query.lat) {
       pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Clone pipeline for count before adding skip/limit/populate
    const countPipeline = [...pipeline, { $count: 'total' }];

    // 5. Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // 6. Populate owner
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner'
      }
    });
    pipeline.push({ $unwind: '$owner' });

    // Ensure we don't leak owner sensitive info
    pipeline.push({
      $project: {
        'owner.password': 0,
        'owner.refreshTokens': 0,
        'owner.failedLoginAttempts': 0,
        'owner.emailVerificationToken': 0,
        'owner.passwordResetToken': 0,
      }
    });

    const [items, countResult] = await Promise.all([
      FoodItem.aggregate(pipeline),
      FoodItem.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      items,
      pagination: buildPagination(page, limit, total),
    };
  }

  async getUserOrders(userId: string, query: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      $or: [{ buyer: userId }, { seller: userId }]
    };
    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('buyer', 'firstName lastName email')
        .populate('seller', 'firstName lastName businessName')
        .populate('items.foodItem', 'name category images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: buildPagination(page, limit, total),
    };
  }

  async cancelOrder(userId: string, orderId: string, reason?: string): Promise<IOrder> {
    return this.updateOrderStatus(orderId, userId, OrderStatus.Cancelled, reason);
  }
}

export default new MarketplaceService();
