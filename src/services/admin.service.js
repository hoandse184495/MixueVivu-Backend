const { prisma } = require('../config/db');

// ========== User Management ==========

const getAllUsers = async ({ role, search }) => {
  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  return await prisma.users.findMany({
    where,
    select: {
      id: true, fullName: true, email: true, phone: true, avatar: true,
      role: true, isActive: true, companyName: true, companyAddress: true,
      businessLicense: true, description: true, providerStatus: true,
      providerRejectReason: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getUserById = async (id) => {
  return await prisma.users.findUnique({
    where: { id },
    select: {
      id: true, fullName: true, email: true, phone: true, avatar: true,
      role: true, isActive: true, companyName: true, companyAddress: true,
      businessLicense: true, description: true, providerStatus: true,
      providerRejectReason: true, createdAt: true,
      _count: { select: { Bookings: true, Tours: true, Reviews: true } },
    },
  });
};

const blockUser = async (id) => {
  return await prisma.users.update({
    where: { id },
    data: { isActive: false },
  });
};

const unblockUser = async (id) => {
  return await prisma.users.update({
    where: { id },
    data: { isActive: true },
  });
};

const approveProvider = async (id) => {
  const provider = await prisma.users.findFirst({
    where: { id, role: 'provider' },
  });
  if (!provider) return null;

  return await prisma.users.update({
    where: { id },
    data: {
      providerStatus: 'approved',
      providerRejectReason: null,
      isActive: true,
    },
  });
};

const rejectProvider = async (id, reason) => {
  const provider = await prisma.users.findFirst({
    where: { id, role: 'provider' },
  });
  if (!provider) return null;

  return await prisma.users.update({
    where: { id },
    data: {
      providerStatus: 'rejected',
      providerRejectReason: reason || '',
    },
  });
};

// ========== Dashboard & Stats ==========

const getDashboard = async () => {
  const [totalUsers, totalProviders, totalTours, totalBookings, revenueResult] = await Promise.all([
    prisma.users.count({ where: { role: 'user' } }),
    prisma.users.count({ where: { role: 'provider' } }),
    prisma.tours.count(),
    prisma.bookings.count(),
    prisma.bookings.aggregate({
      where: { status: { in: ['confirmed', 'completed'] } },
      _sum: { totalPrice: true, commissionAmount: true, providerAmount: true },
    }),
  ]);

  return {
    totalUsers,
    totalProviders,
    totalTours,
    totalBookings,
    totalRevenue: revenueResult._sum.totalPrice || 0,
    totalCommission: revenueResult._sum.commissionAmount || 0,
    totalProviderAmount: revenueResult._sum.providerAmount || 0,
  };
};

const getRevenueStats = async () => {
  const bookings = await prisma.bookings.findMany({
    where: { status: { in: ['confirmed', 'completed'] } },
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

const getBookingStats = async () => {
  const [pending, confirmed, cancelled, completed] = await Promise.all([
    prisma.bookings.count({ where: { status: 'pending' } }),
    prisma.bookings.count({ where: { status: 'confirmed' } }),
    prisma.bookings.count({ where: { status: 'cancelled' } }),
    prisma.bookings.count({ where: { status: 'completed' } }),
  ]);

  return { pending, confirmed, cancelled, completed, total: pending + confirmed + cancelled + completed };
};

const getTopTours = async (limit = 10) => {
  const tours = await prisma.tours.findMany({
    include: {
      _count: { select: { Bookings: true } },
      Users: { select: { fullName: true } },
    },
    orderBy: { Bookings: { _count: 'desc' } },
    take: limit,
  });

  return tours.map((t) => ({
    id: t.id,
    title: t.title,
    location: t.location,
    price: t.price,
    averageRating: t.averageRating,
    bookingCount: t._count.Bookings,
    providerName: t.Users?.fullName,
  }));
};

module.exports = {
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  approveProvider,
  rejectProvider,
  getDashboard,
  getRevenueStats,
  getBookingStats,
  getTopTours,
};
