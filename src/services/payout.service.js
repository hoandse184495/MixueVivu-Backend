const { prisma } = require('../config/db');

const getEligibleBookings = async () => {
  // Bookings with status 'completed' that don't have a payout yet
  const bookings = await prisma.bookings.findMany({
    where: {
      status: 'completed',
      Payouts: { none: {} },
    },
    include: {
      Tours: { select: { title: true, providerId: true, Users: { select: { fullName: true, email: true } } } },
      Users: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
};

const getAllPayouts = async () => {
  return await prisma.payouts.findMany({
    include: {
      Bookings: { select: { id: true, fullName: true, Tours: { select: { title: true } } } },
      Users: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getMyPayouts = async (providerId) => {
  return await prisma.payouts.findMany({
    where: { providerId },
    include: {
      Bookings: { select: { id: true, fullName: true, Tours: { select: { title: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const createPayout = async ({ bookingId }) => {
  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
    include: { Tours: true },
  });

  if (!booking || booking.status !== 'completed') return null;
  if (!booking.Tours?.providerId) return null;

  // Check if payout already exists
  const existing = await prisma.payouts.findFirst({ where: { bookingId } });
  if (existing) return existing;

  return await prisma.payouts.create({
    data: {
      bookingId,
      providerId: booking.Tours.providerId,
      amount: booking.totalPrice || 0,
      commissionAmount: booking.commissionAmount || 0,
      providerAmount: booking.providerAmount || 0,
      status: 'pending',
    },
  });
};

const confirmPayout = async (id) => {
  return await prisma.payouts.update({
    where: { id },
    data: { status: 'paid', paidAt: new Date() },
  });
};

module.exports = {
  getEligibleBookings,
  getAllPayouts,
  getMyPayouts,
  createPayout,
  confirmPayout,
};
