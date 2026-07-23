const { prisma } = require('../config/db');
const notificationService = require('./notification.service');

const createPaymentStatusNotification = async (tx, payment, status) => {
  if (!payment?.userId) return;

  const tourTitle = payment.Bookings?.Tours?.title || 'tour của bạn';
  const notifications = {
    submitted: {
      title: 'Đã gửi xác nhận chuyển khoản',
      message: `Xác nhận thanh toán cho ${tourTitle} đã được gửi. Manager sẽ kiểm tra và xác nhận.`,
    },
    paid: {
      title: 'Thanh toán đã được xác nhận',
      message: `Manager đã xác nhận thanh toán cho ${tourTitle}. Đơn đặt tour của bạn đã sẵn sàng để hoàn thành.`,
    },
    refunded: {
      title: 'Thanh toán đã được hoàn tiền',
      message: `Thanh toán cho ${tourTitle} đã được hoàn tiền. Vui lòng kiểm tra lại đơn đặt tour của bạn.`,
    },
  };
  const notification = notifications[status];
  if (!notification) return;

  await notificationService.createNotification(
    {
      userId: payment.userId,
      bookingId: payment.bookingId,
      tourId: payment.Bookings?.tourId,
      paymentId: payment.id,
      type: `payment_${status}`,
      status,
      ...notification,
    },
    tx
  );
};

const createManagerPaymentNotification = async (tx, payment, status) => {
  const tourTitle = payment?.Bookings?.Tours?.title || 'tour';
  const notifications = {
    submitted: {
      type: 'admin_payment_submitted',
      title: 'Khách đã xác nhận chuyển khoản',
      message: `Khách đã gửi xác nhận thanh toán cho ${tourTitle}. Vào Thanh Toán để kiểm tra và xác nhận.`,
    },
    refunded: {
      type: 'admin_payment_refunded',
      title: 'Thanh toán đã hoàn tiền',
      message: `Giao dịch cho ${tourTitle} đã được đánh dấu hoàn tiền.`,
    },
  };
  const notification = notifications[status];
  if (!notification) return;

  await notificationService.createManagerNotification(
    {
      bookingId: payment.bookingId,
      tourId: payment.Bookings?.tourId,
      paymentId: payment.id,
      status,
      ...notification,
    },
    tx
  );
};

const getAllPayments = async () => {
  return await prisma.payments.findMany({
    include: {
      Bookings: {
        select: {
          id: true,
          fullName: true,
          tourId: true,
          status: true,
          Tours: { select: { title: true } },
        },
      },
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

const submitPayment = async (id, userId, { transactionId, note }) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payments.findFirst({
      where: { id, userId, status: 'pending' },
    });

    if (!payment) return null;

    const updatedPayment = await tx.payments.update({
      where: { id },
      data: {
        status: 'submitted',
        transactionId: transactionId || null,
        note: note || 'Customer submitted bank transfer confirmation',
      },
      include: {
        Bookings: { select: { id: true, tourId: true, Tours: { select: { title: true } } } },
      },
    });

    await createPaymentStatusNotification(tx, updatedPayment, 'submitted');
    await createManagerPaymentNotification(tx, updatedPayment, 'submitted');

    return updatedPayment;
  });
};

const confirmPayment = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payments.findUnique({
      where: { id },
      include: {
        Bookings: { select: { id: true, tourId: true, status: true } },
      },
    });

    if (!existingPayment) return null;

    if (existingPayment.status !== 'submitted') {
      const error = new Error('Only submitted payments can be confirmed');
      error.statusCode = 400;
      throw error;
    }

    if (existingPayment.Bookings?.status === 'cancelled') {
      const error = new Error('Payments for cancelled bookings cannot be confirmed');
      error.statusCode = 400;
      throw error;
    }

    const payment = await tx.payments.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
      include: {
        Bookings: { select: { id: true, tourId: true, Tours: { select: { title: true } } } },
      },
    });

    await createPaymentStatusNotification(tx, payment, 'paid');

    return payment;
  });
};

const refundPayment = async (id, note) => {
  return await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payments.findUnique({
      where: { id },
      include: {
        Bookings: { select: { id: true, status: true } },
      },
    });

    if (!existingPayment) return null;

    if (existingPayment.status !== 'paid') {
      const error = new Error('Only paid payments can be refunded');
      error.statusCode = 400;
      throw error;
    }

    if (existingPayment.Bookings?.status !== 'cancelled') {
      const error = new Error('Chỉ có thể hoàn tiền khi booking đã bị hủy');
      error.statusCode = 400;
      throw error;
    }

    const payment = await tx.payments.update({
      where: { id },
      data: { status: 'refunded', note: note || 'Refunded by admin' },
      include: {
        Bookings: { select: { id: true, tourId: true, Tours: { select: { title: true } } } },
      },
    });

    await createPaymentStatusNotification(tx, payment, 'refunded');
    await createManagerPaymentNotification(tx, payment, 'refunded');

    return payment;
  });
};

module.exports = {
  getAllPayments,
  getMyPayments,
  submitPayment,
  confirmPayment,
  refundPayment,
};
