import VolunteerTask from '../models/VolunteerTask';
import Donation from '../models/Donation';
import { ITaskInput, TaskStatus, DonationStatus } from '../types';
import { ApiError } from '../utils/apiError';

class VolunteerService {
  async getAvailableTasks(query: { page?: number; limit?: number; type?: string; location?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { status: TaskStatus.Open };
    if (query.type) filter.type = query.type;

    const [tasks, total] = await Promise.all([
      VolunteerTask.find(filter)
        .populate('createdBy', 'firstName lastName businessName')
        .populate('relatedDonation')
        .sort({ priority: -1, scheduledDate: 1 })
        .skip(skip)
        .limit(limit),
      VolunteerTask.countDocuments(filter),
    ]);

    return {
      tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getMyTasks(volunteerId: string, status?: string) {
    const filter: Record<string, unknown> = { assignedTo: volunteerId };
    if (status) filter.status = status;

    return VolunteerTask.find(filter)
      .populate('createdBy', 'firstName lastName businessName phone')
      .populate('relatedDonation')
      .sort({ scheduledDate: 1 });
  }

  async createTask(creatorId: string, input: ITaskInput) {
    const task = await VolunteerTask.create({
      ...input,
      createdBy: creatorId,
      status: TaskStatus.Open,
    });
    return task.populate('createdBy', 'firstName lastName');
  }

  async acceptTask(volunteerId: string, taskId: string) {
    const task = await VolunteerTask.findById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    if (task.status !== TaskStatus.Open) {
      throw ApiError.badRequest('Task is no longer available');
    }

    task.assignedTo = volunteerId as any;
    task.status = TaskStatus.Assigned;
    await task.save();

    return task.populate(['createdBy', 'assignedTo']);
  }

  async startTask(volunteerId: string, taskId: string) {
    const task = await VolunteerTask.findOne({
      _id: taskId,
      assignedTo: volunteerId,
      status: TaskStatus.Assigned,
    });

    if (!task) {
      throw ApiError.notFound('Task not found or not assigned to you');
    }

    task.status = TaskStatus.InProgress;
    await task.save();

    // Update related donation if exists
    if (task.relatedDonation) {
      await Donation.findByIdAndUpdate(task.relatedDonation, {
        status: DonationStatus.PickedUp,
        actualPickup: new Date(),
      });
    }

    return task;
  }

  async completeTask(volunteerId: string, taskId: string, notes?: string) {
    const task = await VolunteerTask.findOne({
      _id: taskId,
      assignedTo: volunteerId,
      status: TaskStatus.InProgress,
    });

    if (!task) {
      throw ApiError.notFound('Task not found or not in progress');
    }

    task.status = TaskStatus.Completed;
    task.completedDate = new Date();
    if (notes) task.notes = notes;
    await task.save();

    // Update related donation
    if (task.relatedDonation) {
      await Donation.findByIdAndUpdate(task.relatedDonation, {
        status: DonationStatus.Delivered,
        deliveredAt: new Date(),
      });
    }

    return task;
  }

  async cancelTask(volunteerId: string, taskId: string) {
    const task = await VolunteerTask.findOne({
      _id: taskId,
      assignedTo: volunteerId,
      status: { $in: [TaskStatus.Assigned, TaskStatus.InProgress] },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    task.status = TaskStatus.Open;
    task.assignedTo = undefined;
    await task.save();
    return task;
  }

  async getVolunteerStats(volunteerId: string) {
    const [completed, active, total] = await Promise.all([
      VolunteerTask.countDocuments({ assignedTo: volunteerId, status: TaskStatus.Completed }),
      VolunteerTask.countDocuments({
        assignedTo: volunteerId,
        status: { $in: [TaskStatus.Assigned, TaskStatus.InProgress] },
      }),
      VolunteerTask.countDocuments({ assignedTo: volunteerId }),
    ]);

    return { completed, active, total };
  }
}

export default new VolunteerService();
