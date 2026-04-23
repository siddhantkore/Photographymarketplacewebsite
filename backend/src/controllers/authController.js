import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendOtpEmail } from '../services/emailService.js';

const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function otpExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

async function createOtpRecord({ email, purpose }) {
  const normalizedEmail = normalizeEmail(email);

  const latest = await prisma.emailOtp.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (latest) {
    const secondsSinceLastOtp = Math.floor((Date.now() - new Date(latest.createdAt).getTime()) / 1000);
    if (secondsSinceLastOtp < OTP_COOLDOWN_SECONDS) {
      const error = new Error(`Please wait ${OTP_COOLDOWN_SECONDS - secondsSinceLastOtp}s before requesting another OTP`);
      error.statusCode = 429;
      throw error;
    }
  }

  const code = generateOtpCode();

  await prisma.emailOtp.create({
    data: {
      email: normalizedEmail,
      code,
      purpose,
      expiresAt: otpExpiryDate(),
    },
  });

  return code;
}

async function verifyOtp({ email, purpose, code, consume = false }) {
  const normalizedEmail = normalizeEmail(email);

  const otpEntry = await prisma.emailOtp.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
      code: String(code || '').trim(),
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpEntry) {
    return false;
  }

  await prisma.emailOtp.update({
    where: { id: otpEntry.id },
    data: {
      verifiedAt: new Date(),
      consumedAt: consume ? new Date() : null,
    },
  });

  return true;
}

async function createAndStoreSessionTokens(userId, role) {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600,
  };
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'USER',
        // Temporary bypass while SMTP delivery is disabled.
        isEmailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        joinDate: true,
        isEmailVerified: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user,
        requiresEmailVerification: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    const otpCode = await createOtpRecord({
      email: normalizedEmail,
      purpose: 'EMAIL_VERIFICATION',
    });

    await sendOtpEmail({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'EMAIL_VERIFICATION',
    });

    res.json({
      success: true,
      message: 'Verification OTP sent',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isValid = await verifyOtp({
      email: normalizedEmail,
      purpose: 'EMAIL_VERIFICATION',
      code: otp,
      consume: true,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        joinDate: true,
        isEmailVerified: true,
      },
    });

    const tokens = await createAndStoreSessionTokens(verifiedUser.id, verifiedUser.role);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: verifiedUser,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        ...(user.isEmailVerified ? {} : { isEmailVerified: true }),
      },
    });

    const tokens = await createAndStoreSessionTokens(user.id, user.role);
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (user) {
      const otpCode = await createOtpRecord({
        email: normalizedEmail,
        purpose: 'PASSWORD_RESET',
      });

      await sendOtpEmail({
        email: normalizedEmail,
        otp: otpCode,
        purpose: 'PASSWORD_RESET',
      });
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset OTP has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPasswordResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const isValid = await verifyOtp({
      email,
      purpose: 'PASSWORD_RESET',
      code: otp,
      consume: false,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    res.json({
      success: true,
      message: 'OTP verified',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isValid = await verifyOtp({
      email: normalizedEmail,
      purpose: 'PASSWORD_RESET',
      code: otp,
      consume: true,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword || ''), 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    await prisma.emailOtp.updateMany({
      where: {
        email: normalizedEmail,
        purpose: 'PASSWORD_RESET',
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    verifyRefreshToken(refreshToken);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    if (new Date() > tokenRecord.expiresAt) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
      });
    }

    const newAccessToken = generateAccessToken(tokenRecord.user.id, tokenRecord.user.role);
    const newRefreshToken = generateRefreshToken(tokenRecord.user.id);

    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: tokenRecord.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        joinDate: true,
        isEmailVerified: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, email: normalizeEmail(email) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        joinDate: true,
        isEmailVerified: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
