const { prisma } = require('../config/db');

const getAllPayments = async () => {
  return await prisma.payments.findMany({
    include: {
      Bookings: { select: { id: true, fullName: true, tourId: true } },
      Users: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getMyPayments = async (userId) => {
  return await prisma.payments.findMany({
    where: { userId },
    include: {
      Bookings: {
        select: { id: true, fullName: true, tourId: true, Tours: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const confirmPayment = async (id) => {
  const payment = await prisma.payments.update({
    where: { id },
    data: { status: 'paid', paidAt: new Date() },
  });

  // Also update booking status to confirmed
  await prisma.bookings.update({
    where: { id: payment.bookingId },
    data: { status: 'confirmed' },
  });

  return payment;
};

const refundPayment = async (id, note) => {
  const payment = await prisma.payments.update({
    where: { id },
    data: { status: 'refunded', note: note || 'Refunded by admin' },
  });

  await prisma.bookings.update({
    where: { id: payment.bookingId },
    data: { status: 'cancelled' },
  });

  return payment;
};

module.exports = {
  getAllPayments,
  getMyPayments,
  confirmPayment,
  refundPayment,
};
