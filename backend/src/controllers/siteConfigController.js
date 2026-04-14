/**
 * Site Configuration Controller
 * Handles site-wide settings including watermark, signed URL duration, contact info
 */

import prisma from '../config/database.js';

/**
 * Get site configuration (public - limited fields)
 */
export const getSiteConfig = async (req, res) => {
  try {
    let config = await prisma.siteConfig.findFirst();

    // Create default config if it doesn't exist
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          phoneNumber: '+91 98765 43210',
          email: 'info@likephotostudio.com',
          signedUrlDuration: 3600,
          watermarkText: 'LIKE PHOTO STUDIO',
          watermarkOpacity: 30,
          previewQuality: 60,
        },
      });
    }

    // Return only public fields
    res.json({
      success: true,
      data: {
        phoneNumber: config.phoneNumber,
        email: config.email,
        address: config.address,
      },
    });
  } catch (error) {
    console.error('Error fetching site config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site configuration',
    });
  }
};

/**
 * Get full site configuration (admin)
 */
export const getFullSiteConfig = async (req, res) => {
  try {
    let config = await prisma.siteConfig.findFirst();

    // Create default config if it doesn't exist
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          phoneNumber: '+91 98765 43210',
          email: 'info@likephotostudio.com',
          signedUrlDuration: 3600,
          watermarkText: 'LIKE PHOTO STUDIO',
          watermarkOpacity: 30,
          previewQuality: 60,
        },
      });
    }

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching full site config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site configuration',
    });
  }
};

/**
 * Update site configuration (admin)
 */
export const updateSiteConfig = async (req, res) => {
  try {
    const {
      phoneNumber,
      email,
      address,
      signedUrlDuration,
      watermarkText,
      watermarkOpacity,
      previewQuality,
      allowedImageFormats,
      maxFileSize,
    } = req.body;

    // Get existing config or create new one
    let config = await prisma.siteConfig.findFirst();

    if (!config) {
      config = await prisma.siteConfig.create({
        data: {},
      });
    }

    // Update config
    const updatedConfig = await prisma.siteConfig.update({
      where: { id: config.id },
      data: {
        ...(phoneNumber && { phoneNumber }),
        ...(email && { email }),
        ...(address !== undefined && { address }),
        ...(signedUrlDuration && { signedUrlDuration: parseInt(signedUrlDuration) }),
        ...(watermarkText && { watermarkText }),
        ...(watermarkOpacity !== undefined && {
          watermarkOpacity: Math.max(0, Math.min(100, parseInt(watermarkOpacity))),
        }),
        ...(previewQuality !== undefined && {
          previewQuality: Math.max(0, Math.min(100, parseInt(previewQuality))),
        }),
        ...(allowedImageFormats && { allowedImageFormats }),
        ...(maxFileSize && { maxFileSize: parseInt(maxFileSize) }),
      },
    });

    res.json({
      success: true,
      message: 'Site configuration updated successfully',
      data: updatedConfig,
    });
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update site configuration',
    });
  }
};

/**
 * Get watermark settings (internal use by image processor)
 */
export const getWatermarkSettings = async () => {
  try {
    const config = await prisma.siteConfig.findFirst();
    return {
      text: config?.watermarkText || 'LIKE PHOTO STUDIO',
      opacity: config?.watermarkOpacity || 30,
      quality: config?.previewQuality || 60,
    };
  } catch (error) {
    console.error('Error fetching watermark settings:', error);
    return {
      text: 'LIKE PHOTO STUDIO',
      opacity: 30,
      quality: 60,
    };
  }
};

/**
 * Get signed URL duration (internal use by download controller)
 */
export const getSignedUrlDuration = async () => {
  try {
    const config = await prisma.siteConfig.findFirst();
    return config?.signedUrlDuration || 3600;
  } catch (error) {
    console.error('Error fetching signed URL duration:', error);
    return 3600;
  }
};

export default {
  getSiteConfig,
  getFullSiteConfig,
  updateSiteConfig,
  getWatermarkSettings,
  getSignedUrlDuration,
};
