import User from '../models/User';
import FoodItem from '../models/FoodItem';
import Order from '../models/Order';
import Donation from '../models/Donation';
import { UserRole } from '../types';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger';

class AdminService {
  async getUsers(query: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.role) filter.role = query.role;
    if (query.status === 'active') filter.isActive = true;
    if (query.status === 'inactive') filter.isActive = false;
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { businessName: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const [listingsCount, ordersCount, donationsCount] = await Promise.all([
      FoodItem.countDocuments({ owner: userId }),
      Order.countDocuments({ $or: [{ buyer: userId }, { seller: userId }] }),
      Donation.countDocuments({ $or: [{ donor: userId }, { recipient: userId }] }),
    ]);

    return { user, stats: { listingsCount, ordersCount, donationsCount } };
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    user.role = newRole;
    await user.save();
    logger.info(`Admin updated user ${userId} role to ${newRole}`);
    return user;
  }

  async suspendUser(userId: string, reason: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.role === UserRole.Admin) {
      throw ApiError.forbidden('Cannot suspend admin accounts');
    }

    user.isActive = false;
    await user.save();
    logger.info(`Admin suspended user ${userId}. Reason: ${reason}`);
    return user;
  }

  async reactivateUser(userId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
    if (!user) throw ApiError.notFound('User not found');
    logger.info(`Admin reactivated user ${userId}`);
    return user;
  }

  async verifyNGO(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.role !== UserRole.NGOPartner) {
      throw ApiError.badRequest('User is not an NGO partner');
    }

    user.isEmailVerified = true;
    await user.save();
    logger.info(`Admin verified NGO ${userId}`);
    return user;
  }

  async deleteUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.role === UserRole.Admin) {
      throw ApiError.forbidden('Cannot delete admin accounts');
    }

    // Soft delete - deactivate and anonymize
    user.isActive = false;
    user.email = `deleted_${user._id}@removed.com`;
    user.firstName = 'Deleted';
    user.lastName = 'User';
    user.refreshTokens = [];
    await user.save();

    logger.info(`Admin deleted (anonymized) user ${userId}`);
    return { message: 'User account has been deactivated and anonymized' };
  }

  async getReports(query: { page?: number; limit?: number; type?: string }) {
    // Aggregate reports from various sources
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const expiredItems = await FoodItem.find({ status: 'Expired' })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'firstName lastName businessName');

    const total = await FoodItem.countDocuments({ status: 'Expired' });

    return {
      reports: expiredItems.map((item) => ({
        id: item._id,
        type: 'expired_food',
        item: item.name,
        owner: item.owner,
        date: item.updatedAt,
        quantity: item.quantity,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}

export default new AdminService();
