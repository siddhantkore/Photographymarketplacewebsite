/**
 * Contact Inquiry Controller
 * Handles contact form submissions and inquiries
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Submit contact inquiry (public)
 */
export const submitInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message, inquiryType, serviceId } = req.body;

    // Validation
    if (!name || !email || !subject || !message || !inquiryType) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, message, and inquiry type are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate inquiry type
    const validTypes = ['service', 'advertisement', 'general'];
    if (!validTypes.includes(inquiryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry type',
      });
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        inquiryType,
        serviceId: serviceId || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. We will get back to you soon!',
      data: inquiry,
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry',
    });
  }
};

/**
 * Get all inquiries (admin)
 */
export const getAllInquiries = async (req, res) => {
  try {
    const { status, inquiryType, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (inquiryType) where.inquiryType = inquiryType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.contactInquiry.count({ where }),
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
    });
  }
};

/**
 * Get inquiry by ID (admin)
 */
export const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Mark as read if it's new
    if (inquiry.status === 'NEW') {
      await prisma.contactInquiry.update({
        where: { id },
        data: { status: 'READ' },
      });
    }

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry',
    });
  }
};

/**
 * Update inquiry status (admin)
 */
export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['NEW', 'READ', 'RESPONDED', 'CLOSED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const inquiry = await prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      message: 'Inquiry status updated successfully',
      data: inquiry,
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status',
    });
  }
};

/**
 * Delete inquiry (admin)
 */
export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contactInquiry.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
    });
  }
};

/**
 * Get inquiry statistics (admin)
 */
export const getInquiryStats = async (req, res) => {
  try {
    const [total, newCount, readCount, respondedCount, closedCount, byType] = await Promise.all([
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'NEW' } }),
      prisma.contactInquiry.count({ where: { status: 'READ' } }),
      prisma.contactInquiry.count({ where: { status: 'RESPONDED' } }),
      prisma.contactInquiry.count({ where: { status: 'CLOSED' } }),
      prisma.contactInquiry.groupBy({
        by: ['inquiryType'],
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          new: newCount,
          read: readCount,
          responded: respondedCount,
          closed: closedCount,
        },
        byType: byType.reduce((acc, item) => {
          acc[item.inquiryType] = item._count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Error fetching inquiry stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry statistics',
    });
  }
};

export default {
  submitInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  getInquiryStats,
};
