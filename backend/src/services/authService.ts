import jwt from 'jsonwebtoken';
import User from '../models/User';
import Tenant from '../models/Tenant';
import { IRegisterInput, ILoginInput, ITokenPair, ITokenPayload, IUser, UserRole } from '../types';
import { ApiError } from '../utils/apiError';
import { generateToken } from '../utils/helpers';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email';
import logger from '../utils/logger';

class AuthService {
  private generateTokenPair(payload: ITokenPayload): ITokenPair {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

    if (!accessSecret || !refreshSecret) {
      logger.error('JWT secrets are not configured');
      throw ApiError.internal();
    }

    const accessToken = jwt.sign(payload, accessSecret, {
      expiresIn: accessExpiry as any,
    });

    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: refreshExpiry as any,
    });

    return { accessToken, refreshToken };
  }

  async register(input: IRegisterInput): Promise<{ user: IUser; tokens: ITokenPair }> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const emailVerificationToken = generateToken();
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    let tenantId;
    
    // Create a Tenant if the registering user is a FoodBusinessOwner or NGOPartner
    if (input.role === UserRole.FoodBusinessOwner || input.role === UserRole.NGOPartner) {
      const tenant = await Tenant.create({
        name: input.businessName || `${input.firstName}'s Business`,
        type: input.role === UserRole.FoodBusinessOwner ? 'FoodBusiness' : 'NGO',
      });
      tenantId = tenant._id;
    }

    const user = await User.create({
      ...input,
      tenantId,
      emailVerificationToken,
      emailVerificationExpiry,
    });

    const payload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
    };

    const tokens = this.generateTokenPair(payload);

    // Store refresh token
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
      lastLogin: new Date(),
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, emailVerificationToken).catch((err) => {
      logger.error('Failed to send verification email:', err);
    });

    // Re-fetch without sensitive fields
    const cleanUser = await User.findById(user._id);
    if (!cleanUser) {
      throw ApiError.internal();
    }

    return { user: cleanUser, tokens };
  }

  async login(input: ILoginInput): Promise<{ user: IUser; tokens: ITokenPair }> {
    const user = await User.findOne({ email: input.email })
      .select('+password +failedLoginAttempts +lockUntil +refreshTokens');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
    }

    // Check account lockout
    if (user.isLocked()) {
      throw ApiError.tooManyRequests(
        'Account is temporarily locked due to too many failed login attempts. Please try again in 15 minutes.'
      );
    }

    const isPasswordValid = await user.comparePassword(input.password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Reset failed attempts on successful login
    await user.resetLoginAttempts();

    const payload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
    };

    const tokens = this.generateTokenPair(payload);

    // Store refresh token, keeping max 5 active sessions
    let refreshTokens = user.refreshTokens || [];
    if (refreshTokens.length >= 5) {
      refreshTokens = refreshTokens.slice(-4);
    }
    refreshTokens.push(tokens.refreshToken);

    await User.findByIdAndUpdate(user._id, {
      refreshTokens,
      lastLogin: new Date(),
    });

    const cleanUser = await User.findById(user._id);
    if (!cleanUser) {
      throw ApiError.internal();
    }

    return { user: cleanUser, tokens };
  }

  async refreshToken(refreshToken: string): Promise<ITokenPair> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw ApiError.internal();
    }

    let decoded: ITokenPayload;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret) as ITokenPayload;
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      // Possible token reuse attack - invalidate all tokens
      await User.findByIdAndUpdate(user._id, { refreshTokens: [] });
      logger.warn(`Potential refresh token reuse detected for user ${user._id}`);
      throw ApiError.unauthorized('Invalid refresh token. All sessions have been revoked.');
    }

    const payload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
    };

    const newTokens = this.generateTokenPair(payload);

    // Rotate refresh token
    const updatedTokens = user.refreshTokens
      .filter((t: string) => t !== refreshToken)
      .concat(newTokens.refreshToken);

    await User.findByIdAndUpdate(user._id, { refreshTokens: updatedTokens });

    return newTokens;
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      });
    } else {
      // Logout all sessions
      await User.findByIdAndUpdate(userId, { refreshTokens: [] });
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });

    sendPasswordResetEmail(email, resetToken).catch((err) => {
      logger.error('Failed to send password reset email:', err);
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpiry');

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updates: Partial<IRegisterInput>
  ): Promise<IUser> {
    const allowedFields = [
      'firstName', 'lastName', 'phone',
      'businessName', 'businessType', 'address',
    ];

    const sanitizedUpdates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if ((updates as Record<string, unknown>)[field] !== undefined) {
        sanitizedUpdates[field] = (updates as Record<string, unknown>)[field];
      }
    }

    const user = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}

export default new AuthService();
