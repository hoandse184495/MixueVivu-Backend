const { prisma } = require('../config/db');
const bookingService = require('./booking.service');

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
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payments.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
    });

    await bookingService.confirmBookingWithSlotDeduction(tx, payment.bookingId);

    return payment;
  });
};

const refundPayment = async (id, note) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payments.update({
      where: { id },
      data: { status: 'refunded', note: note || 'Refunded by admin' },
    });

    await bookingService.cancelBookingWithSlotRestore(tx, payment.bookingId);

    return payment;
  });
};

module.exports = {
  getAllPayments,
  getMyPayments,
  confirmPayment,
  refundPayment,
};
