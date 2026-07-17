import nodemailer from 'nodemailer';
import env from './env';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = () => {
  const host = env.SMTP_HOST;
  const port = env.SMTP_PORT || 587;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP credentials not fully configured. Emails will be logged only.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const transporter = createTransporter();

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const from = 'noreply@zerowaste-os.com';

  if (!transporter) {
    logger.info(`[Email Mock] To: ${options.to} | Subject: ${options.subject}`);
    logger.debug(`[Email Mock] Body: ${options.html}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"ZeroWaste OS" <${from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const frontendUrl = env.FRONTEND_URL;
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your ZeroWaste OS account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2d7738;">Welcome to ZeroWaste OS!</h1>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" 
           style="display: inline-block; background-color: #2d7738; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const frontendUrl = env.FRONTEND_URL;
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your ZeroWaste OS password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2d7738;">Password Reset Request</h1>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #2d7738; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">ZeroWaste OS Security Team</p>
      </div>
    `,
  });
};
