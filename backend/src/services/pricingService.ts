import FoodItem from '../models/FoodItem';
import { FoodStatus } from '../types';
import logger from '../utils/logger';

class PricingService {
  /**
   * Evaluates available food items and applies an automatic discount
   * as the item approaches its expiry date.
   */
  async updateDecay(): Promise<void> {
    const now = new Date();
    
    // Find items that expire within the next 24 hours
    const thresholdDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const itemsToDiscount = await FoodItem.find({
      status: FoodStatus.Available,
      expiryDate: { $lte: thresholdDate, $gt: now },
    });

    let updatedCount = 0;

    for (const item of itemsToDiscount) {
      const hoursToExpiry = (item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      let discountPercentage = 0;
      
      if (hoursToExpiry <= 2) {
        discountPercentage = 0.8; // 80% off if < 2 hours left
      } else if (hoursToExpiry <= 6) {
        discountPercentage = 0.5; // 50% off if < 6 hours left
      } else if (hoursToExpiry <= 12) {
        discountPercentage = 0.25; // 25% off if < 12 hours left
      } else {
        discountPercentage = 0.1; // 10% off for within 24 hours
      }

      const newDiscountedPrice = item.originalPrice * (1 - discountPercentage);

      // Only update if the new price is lower than the current discounted price
      // (prevents raising the price if the seller manually set a lower discount)
      if (newDiscountedPrice < item.discountedPrice) {
        await FoodItem.updateOne(
          { _id: item._id },
          { $set: { discountedPrice: newDiscountedPrice } }
        );
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      logger.info(`Cron: Dynamic pricing decay applied to ${updatedCount} food items.`);
    }
  }
}

export default new PricingService();
