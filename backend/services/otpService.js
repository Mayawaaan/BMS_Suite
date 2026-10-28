import crypto from 'crypto';
import { redisService } from '../config/redis.js';

const inMemoryOtpStore = new Map();

const OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10);
const MAX_ATTEMPTS = 5;

export const otpService = {
  /**
   * Generate and store a secure 6-digit OTP for email verification
   */
  async generateOtp(email) {
    const cleanEmail = email.toLowerCase().trim();
    // Cryptographically secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000;

    const otpData = {
      email: cleanEmail,
      otp,
      attempts: 0,
      verified: false,
      expiresAt,
      resetToken: null,
      resetTokenExpiresAt: null,
    };

    // Store in Redis with TTL if available
    const redisKey = `crm:auth:otp:${cleanEmail}`;
    await redisService.set(redisKey, otpData, 'EX', OTP_EXPIRES_MINUTES * 60);

    // Fallback in-memory map
    inMemoryOtpStore.set(cleanEmail, otpData);

    console.log(`[SECURITY OTP] 6-digit OTP generated for [${cleanEmail}]: ${otp} (Expires in ${OTP_EXPIRES_MINUTES}m)`);

    return {
      otp,
      expiresAt,
      expiresInMinutes: OTP_EXPIRES_MINUTES,
    };
  },

  /**
   * Verify submitted OTP against stored code
   */
  async verifyOtp(email, submittedOtp) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = (submittedOtp || '').toString().trim();

    const redisKey = `crm:auth:otp:${cleanEmail}`;
    let record = await redisService.get(redisKey);

    if (!record) {
      record = inMemoryOtpStore.get(cleanEmail);
    }

    if (!record) {
      return {
        success: false,
        code: 'OTP_NOT_FOUND',
        message: 'No verification code requested or code has expired. Please request a new one.',
      };
    }

    if (Date.now() > record.expiresAt) {
      inMemoryOtpStore.delete(cleanEmail);
      await redisService.del(redisKey);
      return {
        success: false,
        code: 'OTP_EXPIRED',
        message: 'Verification code has expired. Please request a new code.',
      };
    }

    record.attempts = (record.attempts || 0) + 1;

    if (record.attempts > MAX_ATTEMPTS) {
      inMemoryOtpStore.delete(cleanEmail);
      await redisService.del(redisKey);
      return {
        success: false,
        code: 'TOO_MANY_ATTEMPTS',
        message: 'Security lockout: Too many incorrect attempts. This code has been invalidated. Please request a new one.',
      };
    }

    if (record.otp !== cleanOtp) {
      const remaining = MAX_ATTEMPTS - record.attempts;
      inMemoryOtpStore.set(cleanEmail, record);
      await redisService.set(redisKey, record, 'EX', Math.max(1, Math.round((record.expiresAt - Date.now()) / 1000)));

      return {
        success: false,
        code: 'INVALID_OTP',
        message: `Incorrect 6-digit verification code. ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`,
      };
    }

    // OTP is valid! Generate one-time cryptographic reset token (valid for 15 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    record.verified = true;
    record.resetToken = resetToken;
    record.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000;

    inMemoryOtpStore.set(cleanEmail, record);
    await redisService.set(redisKey, record, 'EX', 900); // 15 mins

    return {
      success: true,
      message: 'OTP verification successful. Proceed to set your new password.',
      resetToken,
    };
  },

  /**
   * Validate that the reset token is authorized to change password
   */
  async validateResetToken(email, resetToken) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = (resetToken || '').trim();

    const redisKey = `crm:auth:otp:${cleanEmail}`;
    let record = await redisService.get(redisKey);

    if (!record) {
      record = inMemoryOtpStore.get(cleanEmail);
    }

    if (!record || !record.verified || !record.resetToken) {
      return false;
    }

    if (Date.now() > record.resetTokenExpiresAt) {
      return false;
    }

    return record.resetToken === cleanToken;
  },

  /**
   * Invalidate OTP and reset token after password reset is complete
   */
  async consumeResetToken(email) {
    const cleanEmail = email.toLowerCase().trim();
    inMemoryOtpStore.delete(cleanEmail);
    await redisService.del(`crm:auth:otp:${cleanEmail}`);
  },
};

export default otpService;
