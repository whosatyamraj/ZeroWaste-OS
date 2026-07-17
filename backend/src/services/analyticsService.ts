import Order from '../models/Order';
import FoodItem from '../models/FoodItem';
import Donation from '../models/Donation';
import Inventory from '../models/Inventory';
import User from '../models/User';
import { UserRole } from '../types';

class AnalyticsService {
  async getSustainabilityMetrics(userId: string, role: UserRole) {
    const [totalDonations, totalOrders, foodItems] = await Promise.all([
      Donation.countDocuments(role === UserRole.Admin ? {} : { donor: userId, status: 'Delivered' }),
      Order.countDocuments(role === UserRole.Admin ? {} : { seller: userId, status: 'Completed' }),
      FoodItem.find(role === UserRole.Admin ? { status: { $in: ['Sold', 'Donated'] } } : {
        owner: userId,
        status: { $in: ['Sold', 'Donated'] },
      }),
    ]);

    let totalFoodSavedKg = 0;
    foodItems.forEach((item) => {
      totalFoodSavedKg += item.quantity;
    });

    // Industry-standard impact calculations
    const mealsProvided = Math.round(totalFoodSavedKg * 2.5); // ~2.5 meals per kg
    const co2Saved = Math.round(totalFoodSavedKg * 2.5 * 100) / 100; // ~2.5 kg CO₂ per kg food
    const waterSaved = Math.round(totalFoodSavedKg * 1000); // ~1000L water per kg food
    const moneySaved = Math.round(totalFoodSavedKg * 3.5 * 100) / 100; // ~$3.50 per kg

    return {
      totalFoodSavedKg: Math.round(totalFoodSavedKg * 100) / 100,
      mealsProvided,
      co2Saved,
      waterSaved,
      moneySaved,
      totalDonations,
      totalOrders,
      totalItems: foodItems.length,
    };
  }

  async getWasteTrends(userId: string, role: UserRole, period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupFormat = '%Y-%m-%d';
    }

    const matchFilter: Record<string, unknown> = {
      createdAt: { $gte: startDate },
    };

    if (role !== UserRole.Admin) {
      matchFilter.owner = userId;
    }

    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.date': 1 as 1 | -1 } },
    ];

    return FoodItem.aggregate(pipeline);
  }

  async getPlatformAnalytics() {
    const [
      totalUsers,
      totalBusinesses,
      totalNGOs,
      totalVolunteers,
      totalFoodItems,
      totalOrders,
      totalDonations,
      activeListings,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: UserRole.FoodBusinessOwner, isActive: true }),
      User.countDocuments({ role: UserRole.NGOPartner, isActive: true }),
      User.countDocuments({ role: UserRole.Volunteer, isActive: true }),
      FoodItem.countDocuments(),
      Order.countDocuments({ status: 'Completed' }),
      Donation.countDocuments({ status: 'Delivered' }),
      FoodItem.countDocuments({ status: 'Available' }),
    ]);

    const recentActivity = await FoodItem.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('owner', 'firstName lastName businessName');

    return {
      users: { total: totalUsers, businesses: totalBusinesses, ngos: totalNGOs, volunteers: totalVolunteers },
      food: { total: totalFoodItems, active: activeListings },
      transactions: { orders: totalOrders, donations: totalDonations },
      recentActivity,
    };
  }

  async getBusinessDashboard(userId: string) {
    const [listings, orders, donations, inventory] = await Promise.all([
      FoodItem.countDocuments({ owner: userId }),
      Order.countDocuments({ seller: userId }),
      Donation.countDocuments({ donor: userId }),
      Inventory.find({ owner: userId, $expr: { $lte: ['$currentStock', '$minimumStock'] } }).limit(5),
    ]);

    const recentOrders = await Order.find({ seller: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer', 'firstName lastName');

    return {
      stats: { listings, orders, donations },
      lowStockItems: inventory,
      recentOrders,
    };
  }
}

export default new AnalyticsService();
