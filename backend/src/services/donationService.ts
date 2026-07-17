import Donation from '../models/Donation';
import FoodItem from '../models/FoodItem';
import { IDonation, IDonationInput, DonationStatus, FoodStatus, IPaginationQuery, IAddress } from '../types';
import { ApiError } from '../utils/apiError';
import { buildPagination, calculateCO2Saved, calculateMealsProvided, calculateWaterSaved } from '../utils/helpers';
import logger from '../utils/logger';

class DonationService {
  async createDonation(donorId: string, input: IDonationInput): Promise<IDonation> {
    // Validate all food items belong to donor and are available
    for (const item of input.foodItems) {
      const foodItem = await FoodItem.findById(item.foodItem);

      if (!foodItem) {
        throw ApiError.notFound(`Food item ${item.foodItem} not found`);
      }

      if (foodItem.owner.toString() !== donorId) {
        throw ApiError.forbidden('You can only donate your own food items');
      }

      if (foodItem.status !== FoodStatus.Available) {
        throw ApiError.badRequest(`Food item "${foodItem.name}" is not available for donation`);
      }

      if (!foodItem.isDonatable) {
        throw ApiError.badRequest(`Food item "${foodItem.name}" is not marked as donatable`);
      }

      if (item.quantity > foodItem.quantity) {
        throw ApiError.badRequest(
          `Requested donation quantity for "${foodItem.name}" exceeds available stock`
        );
      }
    }

    const donation = await Donation.create({
      donor: donorId,
      foodItems: input.foodItems.map((item) => ({
        foodItem: item.foodItem,
        quantity: item.quantity,
      })),
      pickupAddress: input.pickupAddress,
      scheduledPickup: input.scheduledPickup ? new Date(input.scheduledPickup) : undefined,
      notes: input.notes,
    });

    // Update food item statuses
    for (const item of input.foodItems) {
      await FoodItem.findByIdAndUpdate(item.foodItem, {
        status: FoodStatus.Donated,
        $inc: { quantity: -item.quantity },
      });
    }

    const populated = await Donation.findById(donation._id)
      .populate('donor', 'firstName lastName businessName email phone')
      .populate('foodItems.foodItem', 'name category quantity unit');

    if (!populated) {
      throw ApiError.internal();
    }

    logger.info(`Donation created: ${donation._id} by donor ${donorId}`);
    return populated;
  }

  async getDonations(query: IPaginationQuery & { status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('donor', 'firstName lastName businessName')
        .populate('recipient', 'firstName lastName businessName')
        .populate('volunteer', 'firstName lastName')
        .populate('foodItems.foodItem', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments(filter),
    ]);

    return {
      donations,
      pagination: buildPagination(page, limit, total),
    };
  }

  async getMyDonations(
    userId: string,
    role: 'donor' | 'recipient' | 'volunteer',
    query: IPaginationQuery & { status?: string }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { [role]: userId };
    if (query.status) filter.status = query.status;

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('donor', 'firstName lastName businessName')
        .populate('recipient', 'firstName lastName businessName')
        .populate('volunteer', 'firstName lastName')
        .populate('foodItems.foodItem', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments(filter),
    ]);

    return {
      donations,
      pagination: buildPagination(page, limit, total),
    };
  }

  async getDonationById(id: string): Promise<IDonation> {
    const donation = await Donation.findById(id)
      .populate('donor', 'firstName lastName businessName email phone')
      .populate('recipient', 'firstName lastName businessName email phone')
      .populate('volunteer', 'firstName lastName email phone')
      .populate('foodItems.foodItem', 'name category quantity unit images');

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    return donation;
  }

  async updateDonationStatus(
    id: string,
    userId: string,
    status: DonationStatus,
    deliveryAddress?: IAddress
  ): Promise<IDonation> {
    const donation = await Donation.findById(id);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    const validTransitions: Record<string, DonationStatus[]> = {
      [DonationStatus.Pending]: [DonationStatus.Accepted, DonationStatus.Cancelled],
      [DonationStatus.Accepted]: [DonationStatus.PickedUp, DonationStatus.Cancelled],
      [DonationStatus.PickedUp]: [DonationStatus.Delivered, DonationStatus.Cancelled],
    };

    const allowed = validTransitions[donation.status];
    if (!allowed || !allowed.includes(status)) {
      throw ApiError.badRequest(
        `Cannot transition from '${donation.status}' to '${status}'`
      );
    }

    const updateData: Record<string, unknown> = { status };

    if (status === DonationStatus.Accepted) {
      updateData.recipient = userId;
      if (deliveryAddress) {
        updateData.deliveryAddress = deliveryAddress;
      }
    }

    if (status === DonationStatus.PickedUp) {
      updateData.actualPickup = new Date();
    }

    if (status === DonationStatus.Delivered) {
      updateData.deliveredAt = new Date();

      // Calculate impact metrics
      let totalWeight = 0;
      for (const item of donation.foodItems) {
        const foodItem = await FoodItem.findById(item.foodItem);
        if (foodItem) {
          totalWeight += item.quantity;
        }
      }

      updateData.impactMetrics = {
        mealsProvided: calculateMealsProvided(totalWeight),
        co2Saved: calculateCO2Saved(totalWeight),
        waterSaved: calculateWaterSaved(totalWeight),
      };
    }

    if (status === DonationStatus.Cancelled) {
      // Restore food items
      for (const item of donation.foodItems) {
        await FoodItem.findByIdAndUpdate(item.foodItem, {
          status: FoodStatus.Available,
          $inc: { quantity: item.quantity },
        });
      }
    }

    const updated = await Donation.findByIdAndUpdate(id, updateData, { new: true })
      .populate('donor', 'firstName lastName businessName')
      .populate('recipient', 'firstName lastName businessName')
      .populate('volunteer', 'firstName lastName')
      .populate('foodItems.foodItem', 'name category');

    if (!updated) {
      throw ApiError.notFound('Donation not found');
    }

    logger.info(`Donation ${id} status updated to ${status} by user ${userId}`);
    return updated;
  }

  async assignVolunteer(donationId: string, volunteerId: string): Promise<IDonation> {
    const donation = await Donation.findById(donationId);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    if (donation.volunteer) {
      throw ApiError.conflict('A volunteer is already assigned to this donation');
    }

    const updated = await Donation.findByIdAndUpdate(
      donationId,
      { volunteer: volunteerId },
      { new: true }
    )
      .populate('donor', 'firstName lastName businessName')
      .populate('recipient', 'firstName lastName businessName')
      .populate('volunteer', 'firstName lastName');

    if (!updated) {
      throw ApiError.notFound('Donation not found');
    }

    logger.info(`Volunteer ${volunteerId} assigned to donation ${donationId}`);
    return updated;
  }

  async getAvailableDonations(query: IPaginationQuery) {
    return this.getDonations({ ...query, status: DonationStatus.Pending });
  }

  async acceptDonation(recipientId: string, donationId: string): Promise<IDonation> {
    return this.updateDonationStatus(donationId, recipientId, DonationStatus.Accepted);
  }

  async schedulePickup(userId: string, donationId: string, scheduledPickup: Date | string): Promise<IDonation> {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }
    if (donation.donor.toString() !== userId && donation.recipient?.toString() !== userId) {
      throw ApiError.forbidden('You do not have permission to schedule pickup for this donation');
    }
    const updated = await Donation.findByIdAndUpdate(
      donationId,
      { scheduledPickup: new Date(scheduledPickup) },
      { new: true }
    )
      .populate('donor', 'firstName lastName businessName email phone')
      .populate('recipient', 'firstName lastName businessName email phone')
      .populate('volunteer', 'firstName lastName email phone')
      .populate('foodItems.foodItem', 'name category quantity unit');

    if (!updated) {
      throw ApiError.notFound('Donation not found');
    }
    return updated;
  }

  async getUserDonations(userId: string, userRole: string) {
    let roleMapped: 'donor' | 'recipient' | 'volunteer' = 'donor';
    const roleUpper = userRole.toUpperCase().replace(/\s+/g, '');
    if (roleUpper.includes('NGO')) {
      roleMapped = 'recipient';
    } else if (roleUpper.includes('VOLUNTEER')) {
      roleMapped = 'volunteer';
    }
    return this.getMyDonations(userId, roleMapped, { page: 1, limit: 100 });
  }
}

export default new DonationService();
