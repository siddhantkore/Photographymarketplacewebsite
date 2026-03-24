import prisma from '../config/database.js';

export const getAdvertisements = async (req, res, next) => {
  try {
    const { position, status = 'ACTIVE' } = req.query;

    const where = {};
    if (status && String(status).toUpperCase() !== 'ALL') {
      where.status = String(status).toUpperCase();
    }
    if (position) where.position = position.toUpperCase().replace('-', '_');

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    const transformedAds = ads.map((ad) => ({
      id: ad.id,
      image: ad.image,
      url: ad.url,
      status: ad.status.toLowerCase(),
      position: ad.position.toLowerCase().replace('_', '-'),
      priority: ad.priority,
      gridIndex: ad.gridIndex,
    }));

    res.json({
      success: true,
      data: transformedAds,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdvertisement = async (req, res, next) => {
  try {
    const { image, url, position, status = 'ACTIVE', priority = 0, gridIndex } = req.body;

    const ad = await prisma.advertisement.create({
      data: {
        image,
        url,
        position: position.toUpperCase().replace('-', '_'),
        status: status.toUpperCase(),
        priority,
        gridIndex,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.position) {
      updateData.position = updateData.position.toUpperCase().replace('-', '_');
    }
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }

    const ad = await prisma.advertisement.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.advertisement.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Advertisement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getGoogleAdSettings = async (req, res, next) => {
  try {
    let settings = await prisma.googleAdSettings.findFirst();

    if (!settings) {
      // Create default settings
      settings = await prisma.googleAdSettings.create({
        data: {
          adClientId: process.env.GOOGLE_ADSENSE_CLIENT_ID || '',
          enableVignette: false,
          enableSideRail: true,
          enableAnchor: true,
          vignettePlaces: ['/'],
          sideRailPlaces: ['/', '/explore', '/blog'],
          anchorPlaces: ['/', '/explore', '/product', '/blog'],
          excludedPages: ['/checkout', '/cart'],
        },
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoogleAdSettings = async (req, res, next) => {
  try {
    let settings = await prisma.googleAdSettings.findFirst();

    if (settings) {
      settings = await prisma.googleAdSettings.update({
        where: { id: settings.id },
        data: req.body,
      });
    } else {
      settings = await prisma.googleAdSettings.create({
        data: req.body,
      });
    }

    res.json({
      success: true,
      message: 'Google Ad settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
