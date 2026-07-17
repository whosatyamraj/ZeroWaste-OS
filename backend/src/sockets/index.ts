import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { ITokenPayload } from '../types';

interface AuthenticatedSocket extends Socket {
  user?: ITokenPayload;
}

export function initializeSocket(io: SocketServer): void {
  // Authentication middleware for Socket.io
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        return next(new Error('Server configuration error'));
      }
      const decoded = jwt.verify(token, secret) as ITokenPayload;
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Join user-specific room
    if (userId) {
      socket.join(`user:${userId}`);
      socket.join(`role:${socket.user?.role}`);
    }

    // ===========================
    // Kitchen Intelligence Events
    // ===========================
    socket.on('kitchen:join', (kitchenId: string) => {
      socket.join(`kitchen:${kitchenId}`);
      logger.info(`User ${userId} joined kitchen ${kitchenId}`);
    });

    socket.on('kitchen:leave', (kitchenId: string) => {
      socket.leave(`kitchen:${kitchenId}`);
    });

    socket.on('kitchen:order-update', (data: { kitchenId: string; order: unknown }) => {
      io.to(`kitchen:${data.kitchenId}`).emit('kitchen:order-updated', data.order);
    });

    socket.on('kitchen:inventory-alert', (data: { kitchenId: string; alert: unknown }) => {
      io.to(`kitchen:${data.kitchenId}`).emit('kitchen:inventory-alert', data.alert);
    });

    socket.on('kitchen:production-update', (data: { kitchenId: string; production: unknown }) => {
      io.to(`kitchen:${data.kitchenId}`).emit('kitchen:production-updated', data.production);
    });

    // ===========================
    // Donation Events
    // ===========================
    socket.on('donation:new', (donation: unknown) => {
      io.to('role:NGOPartner').emit('donation:available', donation);
    });

    socket.on('donation:accepted', (data: { donationId: string; ngoId: string }) => {
      io.to(`user:${data.ngoId}`).emit('donation:accepted', data);
    });

    socket.on('donation:status-update', (data: { donationId: string; status: string; recipientId: string; donorId: string }) => {
      io.to(`user:${data.recipientId}`).emit('donation:status-changed', data);
      io.to(`user:${data.donorId}`).emit('donation:status-changed', data);
    });

    // ===========================
    // Volunteer Events
    // ===========================
    socket.on('task:new', (task: unknown) => {
      io.to('role:Volunteer').emit('task:available', task);
    });

    socket.on('task:accepted', (data: { taskId: string; volunteerId: string }) => {
      io.to('role:Volunteer').emit('task:taken', data);
    });

    socket.on('task:location-update', (data: { taskId: string; location: { lat: number; lng: number } }) => {
      // Broadcast to task stakeholders
      io.emit('task:location', data);
    });

    // ===========================
    // Notification Events
    // ===========================
    socket.on('notification:read', (notificationId: string) => {
      // Could update DB here
      socket.emit('notification:marked-read', notificationId);
    });

    // ===========================
    // Marketplace Events
    // ===========================
    socket.on('marketplace:new-listing', (listing: unknown) => {
      socket.broadcast.emit('marketplace:listing-added', listing);
    });

    socket.on('marketplace:order-update', (data: { orderId: string; sellerId: string; buyerId: string; status: string }) => {
      io.to(`user:${data.sellerId}`).emit('order:status-changed', data);
      io.to(`user:${data.buyerId}`).emit('order:status-changed', data);
    });

    // ===========================
    // Disconnect
    // ===========================
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error: ${socket.id}`, err);
    });
  });

  logger.info('Socket.io initialized');
}

// Helper to emit events from outside socket handlers
export function emitToUser(io: SocketServer, userId: string, event: string, data: unknown): void {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToRole(io: SocketServer, role: string, event: string, data: unknown): void {
  io.to(`role:${role}`).emit(event, data);
}

export function emitToKitchen(io: SocketServer, kitchenId: string, event: string, data: unknown): void {
  io.to(`kitchen:${kitchenId}`).emit(event, data);
}
