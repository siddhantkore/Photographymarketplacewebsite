/**
 * Service Controller
 * Handles CRUD operations for photography services
 */

import prisma from '../config/database.js';

/**
 * Get all active services (public)
 */
export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
    });
  }
};

/**
 * Get all services (admin - includes inactive)
 */
export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('Error fetching all services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
    });
  }
};

/**
 * Get single service by ID
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
    });
  }
};

/**
 * Create new service (admin)
 */
export const createService = async (req, res) => {
  try {
    const { title, description, icon, price, features, image, status, order } = req.body;

    // Validation
    if (!title || !description || !icon) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and icon are required',
      });
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        icon,
        price: price || null,
        features: features || [],
        image: image || null,
        status: status || 'ACTIVE',
        order: order || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
    });
  }
};

/**
 * Update service (admin)
 */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, price, features, image, status, order } = req.body;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(price !== undefined && { price }),
        ...(features && { features }),
        ...(image !== undefined && { image }),
        ...(status && { status }),
        ...(order !== undefined && { order }),
      },
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
    });
  }
};

/**
 * Delete service (admin)
 */
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    await prisma.service.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
    });
  }
};

/**
 * Reorder services (admin)
 */
export const reorderServices = async (req, res) => {
  try {
    const { serviceOrders } = req.body; // Array of {id, order}

    if (!Array.isArray(serviceOrders)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format',
      });
    }

    // Update each service order
    await Promise.all(
      serviceOrders.map(({ id, order }) =>
        prisma.service.update({
          where: { id },
          data: { order },
        })
      )
    );

    res.json({
      success: true,
      message: 'Services reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder services',
    });
  }
};

export default {
  getServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  reorderServices,
};
