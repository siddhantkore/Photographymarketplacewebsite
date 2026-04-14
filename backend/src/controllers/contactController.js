/**
 * Contact Inquiry Controller
 * Handles contact form submissions and inquiries
 */

import prisma from '../config/database.js';

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
    const {
      status,
      inquiryType,
      adminTag,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};
    if (status && String(status).toLowerCase() !== 'all') where.status = String(status).toUpperCase();
    if (inquiryType && String(inquiryType).toLowerCase() !== 'all') where.inquiryType = inquiryType;
    if (adminTag && String(adminTag).toLowerCase() !== 'all') where.adminTag = String(adminTag).trim();

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { subject: { contains: String(search), mode: 'insensitive' } },
        { message: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const skip = (parsedPage - 1) * parsedLimit;
    const safeSortBy = ['createdAt', 'updatedAt', 'status', 'name'].includes(String(sortBy))
      ? String(sortBy)
      : 'createdAt';
    const safeSortOrder = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { [safeSortBy]: safeSortOrder },
        skip,
        take: parsedLimit,
      }),
      prisma.contactInquiry.count({ where }),
    ]);

    const transformed = inquiries.map((inquiry) => ({
      ...inquiry,
      isNew: inquiry.status === 'NEW' && !inquiry.readAt,
    }));

    res.json({
      success: true,
      data: transformed,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit),
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
        data: { status: 'READ', readAt: new Date() },
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
    const { status, adminTag } = req.body;

    const validStatuses = ['NEW', 'READ', 'RESPONDED', 'CLOSED', 'PENDING', 'ONGOING', 'COMPLETED', 'NA'];
    if (!status && typeof adminTag !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'status or adminTag is required',
      });
    }

    if (status && !validStatuses.includes(String(status).toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const normalizedStatus = status ? String(status).toUpperCase() : undefined;

    const inquiry = await prisma.contactInquiry.update({
      where: { id },
      data: {
        ...(normalizedStatus ? { status: normalizedStatus } : {}),
        ...(typeof adminTag === 'string' ? { adminTag: adminTag.trim() || null } : {}),
        ...(normalizedStatus && normalizedStatus !== 'NEW' ? { readAt: new Date() } : {}),
        ...(normalizedStatus === 'NEW' ? { readAt: null } : {}),
      },
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
    const [total, newCount, readCount, respondedCount, closedCount, byType, byTag] = await Promise.all([
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'NEW' } }),
      prisma.contactInquiry.count({ where: { status: 'READ' } }),
      prisma.contactInquiry.count({ where: { status: 'RESPONDED' } }),
      prisma.contactInquiry.count({ where: { status: 'CLOSED' } }),
      prisma.contactInquiry.groupBy({
        by: ['inquiryType'],
        _count: true,
      }),
      prisma.contactInquiry.groupBy({
        by: ['adminTag'],
        where: {
          adminTag: {
            not: null,
          },
        },
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
        byTag: byTag.reduce((acc, item) => {
          if (!item.adminTag) return acc;
          acc[item.adminTag] = item._count;
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
