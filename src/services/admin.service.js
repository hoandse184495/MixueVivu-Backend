const { prisma } = require('../config/db');
const bcrypt = require('bcryptjs');
const notificationService = require('./notification.service');

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

const getProviderStatus = (role, providerStatus) =>
  role === 'provider' ? providerStatus || 'pending' : 'approved';

const createUser = async ({
  fullName,
  email,
  password,
  phone,
  role = 'user',
  companyName,
  companyAddress,
  businessLicense,
  description,
  providerStatus,
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.users.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      phone: phone || '',
      role,
      providerStatus: getProviderStatus(role, providerStatus),
      providerRejectReason: '',
      companyName: role === 'provider' ? companyName || '' : null,
      companyAddress: role === 'provider' ? companyAddress || '' : null,
      businessLicense: role === 'provider' ? businessLicense || '' : null,
      description: role === 'provider' ? description || '' : null,
      isActive: true,
    },
    select: {
      id: true, fullName: true, email: true, phone: true, avatar: true,
      role: true, isActive: true, companyName: true, companyAddress: true,
      businessLicense: true, description: true, providerStatus: true,
      providerRejectReason: true, createdAt: true,
    },
  });
};

const updateUser = async (
  id,
  {
    fullName,
    email,
    password,
    phone,
    role,
    isActive,
    companyName,
    companyAddress,
    businessLicense,
    description,
    providerStatus,
    providerRejectReason,
  }
) => {
  const data = {};

  if (fullName !== undefined) data.fullName = fullName;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone || '';
  if (role !== undefined) data.role = role;
  if (isActive !== undefined) data.isActive = Boolean(isActive);
  if (password) data.password = await bcrypt.hash(password, 10);

  const nextRole = role || undefined;
  if (nextRole === 'provider') {
    data.providerStatus = providerStatus || 'pending';
    data.providerRejectReason = providerRejectReason || '';
    data.companyName = companyName || '';
    data.companyAddress = companyAddress || '';
    data.businessLicense = businessLicense || '';
    data.description = description || '';
  } else if (nextRole === 'user' || nextRole === 'manager') {
    data.providerStatus = 'approved';
    data.providerRejectReason = null;
    data.companyName = null;
    data.companyAddress = null;
    data.businessLicense = null;
    data.description = null;
  } else {
    if (providerStatus !== undefined) data.providerStatus = providerStatus;
    if (providerRejectReason !== undefined) data.providerRejectReason = providerRejectReason || '';
    if (companyName !== undefined) data.companyName = companyName || '';
    if (companyAddress !== undefined) data.companyAddress = companyAddress || '';
    if (businessLicense !== undefined) data.businessLicense = businessLicense || '';
    if (description !== undefined) data.description = description || '';
  }

  return await prisma.users.update({
    where: { id },
    data,
    select: {
      id: true, fullName: true, email: true, phone: true, avatar: true,
      role: true, isActive: true, companyName: true, companyAddress: true,
      businessLicense: true, description: true, providerStatus: true,
      providerRejectReason: true, createdAt: true,
    },
  });
};

const deleteUser = async (id) => {
  await prisma.refreshTokens.deleteMany({ where: { userId: id } });
  await prisma.notifications.deleteMany({ where: { userId: id } });

  return await prisma.users.delete({
    where: { id },
  });
};

const approveProvider = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const provider = await tx.users.findFirst({
      where: { id, role: 'provider' },
    });
    if (!provider) return null;

    const updatedProvider = await tx.users.update({
      where: { id },
      data: {
        providerStatus: 'approved',
        providerRejectReason: null,
        isActive: true,
      },
    });

    await notificationService.createNotification(
      {
        userId: id,
        type: 'provider_approved',
        title: 'Tài khoản provider đã được duyệt',
        message: 'Manager đã duyệt tài khoản công ty du lịch của bạn. Bạn có thể đăng tour và quản lý booking.',
        status: 'approved',
      },
      tx
    );

    return updatedProvider;
  });
};

const rejectProvider = async (id, reason) => {
  return await prisma.$transaction(async (tx) => {
    const provider = await tx.users.findFirst({
      where: { id, role: 'provider' },
    });
    if (!provider) return null;

    const rejectReason = reason || 'Thông tin công ty chưa đạt yêu cầu';
    const updatedProvider = await tx.users.update({
      where: { id },
      data: {
        providerStatus: 'rejected',
        providerRejectReason: rejectReason,
      },
    });

    await notificationService.createNotification(
      {
        userId: id,
        type: 'provider_rejected',
        title: 'Tài khoản provider bị từ chối',
        message: `Manager đã từ chối tài khoản công ty du lịch của bạn. Lý do: ${rejectReason}.`,
        status: 'rejected',
      },
      tx
    );

    return updatedProvider;
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
  createUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  approveProvider,
  rejectProvider,
  getDashboard,
  getRevenueStats,
  getBookingStats,
  getTopTours,
};
