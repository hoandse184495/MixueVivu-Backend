const { prisma } = require('../config/db');

const getProviderStats = async (providerId) => {
  const [totalTours, totalBookings, revenueResult, payoutResult] = await Promise.all([
    prisma.tours.count({ where: { providerId } }),
    prisma.bookings.count({
      where: { Tours: { providerId } },
    }),
    prisma.bookings.aggregate({
      where: { Tours: { providerId }, status: { in: ['confirmed', 'completed'] } },
      _sum: { totalPrice: true, commissionAmount: true, providerAmount: true },
    }),
    prisma.payouts.aggregate({
      where: { providerId, status: 'paid' },
      _sum: { providerAmount: true },
    }),
  ]);

  return {
    totalTours,
    totalBookings,
    totalRevenue: revenueResult._sum.totalPrice || 0,
    totalCommission: revenueResult._sum.commissionAmount || 0,
    totalProviderAmount: revenueResult._sum.providerAmount || 0,
    totalPaidOut: payoutResult._sum.providerAmount || 0,
  };
};

const getProviderRevenueByMonth = async (providerId) => {
  const bookings = await prisma.bookings.findMany({
    where: { Tours: { providerId }, status: { in: ['confirmed', 'completed'] } },
    select: { totalPrice: true, commissionAmount: true, providerAmount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const monthlyStats = {};
  for (const b of bookings) {
    if (!b.createdAt) continue;
    const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyStats[key]) {
      monthlyStats[key] = { month: key, revenue: 0, commission: 0, providerAmount: 0, count: 0 };
    }
    monthlyStats[key].revenue += Number(b.totalPrice || 0);
    monthlyStats[key].commission += Number(b.commissionAmount || 0);
    monthlyStats[key].providerAmount += Number(b.providerAmount || 0);
    monthlyStats[key].count += 1;
  }

  return Object.values(monthlyStats);
};

module.exports = { getProviderStats, getProviderRevenueByMonth };
