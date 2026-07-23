const { prisma } = require('../config/db');
const notificationService = require('./notification.service');

const findUserByEmail = async (email) => {
  return await prisma.users.findFirst({
    where: { email },
  });
};

const findUserById = async (id) => {
  return await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
      providerStatus: true,
      providerRejectReason: true,
      companyName: true,
      companyAddress: true,
      businessLicense: true,
      description: true,
      createdAt: true,
    },
  });
};

const getUserStats = async (userId) => {
  const [bookings, favorites, reviews] = await Promise.all([
    prisma.bookings.count({ where: { userId } }),
    prisma.favorites.count({ where: { userId } }),
    prisma.reviews.count({ where: { userId } }),
  ]);

  return {
    bookings,
    favorites,
    reviews,
  };
};

const updateUserProfile = async (id, { fullName, phone, avatar }) => {
  return await prisma.users.update({
    where: { id },
    data: {
      fullName,
      phone: phone || '',
      avatar: avatar || '',
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      providerStatus: true,
      providerRejectReason: true,
      createdAt: true,
    },
  });
};

const createUser = async ({ fullName, email, password, phone }) => {
  return await prisma.users.create({
    data: {
      fullName,
      email,
      password,
      phone: phone || '',
      role: 'user',
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
    },
  });
};

const createRefreshToken = async ({ userId, tokenHash, expiresAt }) => {
  await prisma.refreshTokens.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
};

const consumeRefreshToken = async (tokenHash) => {
  const token = await prisma.refreshTokens.findUnique({
    where: { tokenHash },
  });

  if (!token || token.expiresAt <= new Date()) {
    if (token) {
      await prisma.refreshTokens.delete({ where: { tokenHash } });
    }
    return undefined;
  }

  await prisma.refreshTokens.delete({
    where: { tokenHash },
  });

  return await findUserById(token.userId);
};

const revokeRefreshToken = async (tokenHash) => {
  await prisma.refreshTokens.deleteMany({
    where: { tokenHash },
  });
};

const changePassword = async (id, newHashedPassword) => {
  return await prisma.users.update({
    where: { id },
    data: { password: newHashedPassword },
  });
};

const createProvider = async ({ fullName, email, password, phone, companyName, companyAddress, businessLicense, description }) => {
  return await prisma.$transaction(async (tx) => {
    const provider = await tx.users.create({
      data: {
        fullName,
        email,
        password,
        phone: phone || '',
        role: 'provider',
        providerStatus: 'pending',
        providerRejectReason: '',
        companyName: companyName || '',
        companyAddress: companyAddress || '',
        businessLicense: businessLicense || '',
        description: description || '',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        companyName: true,
        providerStatus: true,
      },
    });

    await notificationService.createManagerNotification(
      {
        type: 'admin_provider_pending',
        title: 'Provider mới chờ duyệt',
        message: `${provider.companyName || provider.fullName} vừa đăng ký làm provider. Vào Người dùng để duyệt hoặc từ chối.`,
        status: 'pending',
      },
      tx
    );

    return provider;
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  getUserStats,
  updateUserProfile,
  createUser,
  createRefreshToken,
  consumeRefreshToken,
  revokeRefreshToken,
  changePassword,
  createProvider,
};
