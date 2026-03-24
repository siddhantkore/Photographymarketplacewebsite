import prisma from '../config/database.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [userCount, productCount, completedOrderStats, orderCount, newInquiryCount, recentOrders, popularProducts] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.aggregate({
          where: { status: 'COMPLETED' },
          _count: { _all: true },
          _sum: { total: true },
        }),
        prisma.order.count(),
        prisma.contactInquiry.count({
          where: { status: 'NEW' },
        }),
        prisma.order.findMany({
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            items: true,
          },
        }),
        prisma.product.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { popularity: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            popularity: true,
            categories: true,
          },
        }),
      ]);

    res.json({
      success: true,
      data: {
        cards: {
          totalUsers: userCount,
          totalProducts: productCount,
          totalOrders: orderCount,
          completedOrders: completedOrderStats._count._all,
          totalRevenue: completedOrderStats._sum.total || 0,
          newInquiries: newInquiryCount,
        },
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          userName: order.user?.name || order.user?.email || 'Unknown',
          itemsCount: order.items.length,
          total: order.total,
          createdAt: order.createdAt,
        })),
        popularProducts: popularProducts.map((product) => ({
          id: product.id,
          title: product.title,
          popularity: product.popularity,
          category: product.categories?.[0] || '',
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
