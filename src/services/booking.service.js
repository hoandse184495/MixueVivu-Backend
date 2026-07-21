const { prisma } = require('../config/db');
const notificationService = require('./notification.service');

const createHttpError = (message, statusCode = 400) =>
  Object.assign(new Error(message), { statusCode });

const createBookingStatusNotification = async (tx, booking, status) => {
  if (!booking?.userId) return;

  const tourTitle = booking.Tours?.title || 'tour của bạn';
  const notifications = {
    confirmed: {
      type: 'booking_confirmed',
      title: 'Đơn đặt tour đã được xác nhận',
      message: `Provider đã xác nhận đơn đặt ${tourTitle}. Vui lòng kiểm tra thanh toán để hoàn tất chuyến đi.`,
    },
    cancelled: {
      type: 'booking_rejected',
      title: 'Đơn đặt tour bị từ chối',
      message: `Đơn đặt ${tourTitle} đã bị từ chối hoặc hủy. Bạn có thể đặt tour khác phù hợp hơn.`,
    },
    completed: {
      type: 'booking_completed',
      title: 'Đặt tour thành công',
      message: `Đơn đặt ${tourTitle} đã hoàn thành sau khi thanh toán được xác nhận.`,
    },
  };
  const notification = notifications[status];
  if (!notification) return;

  await notificationService.createNotification(
    {
      userId: booking.userId,
      bookingId: booking.id,
      tourId: booking.tourId,
      status,
      ...notification,
    },
    tx
  );
};

const getBookingForSlotUpdate = async (tx, id, providerId) => {
  return await tx.bookings.findFirst({
    where: {
      id: Number(id),
      ...(providerId ? { Tours: { providerId } } : {}),
    },
    include: { Tours: true },
  });
};

const deductSlotsForBooking = async (tx, booking) => {
  if (!booking || booking.slotsDeducted) return;

  const peopleCount = Number(booking.numberOfPeople || 0);
  const slotUpdate = await tx.tours.updateMany({
    where: {
      id: booking.tourId,
      availableSlots: { gte: peopleCount },
    },
    data: {
      availableSlots: { decrement: peopleCount },
    },
  });

  if (slotUpdate.count === 0) {
    throw createHttpError('Not enough available slots for this booking');
  }
};

const confirmBookingWithSlotDeduction = async (tx, id, providerId) => {
  const booking = await getBookingForSlotUpdate(tx, id, providerId);
  if (!booking) return null;

  if (booking.status === 'cancelled') {
    throw createHttpError('Cancelled bookings cannot be confirmed');
  }

  const nextStatus = booking.status === 'completed' ? 'completed' : 'confirmed';

  const updatedBooking = await tx.bookings.update({
    where: { id: booking.id },
    data: { status: nextStatus },
    include: { Tours: true },
  });

  if (nextStatus === 'confirmed' && booking.status !== 'confirmed') {
    await createBookingStatusNotification(tx, updatedBooking, 'confirmed');
  }

  return updatedBooking;
};

const cancelBookingWithSlotRestore = async (tx, id, providerId, notifyUser = false) => {
  const booking = await getBookingForSlotUpdate(tx, id, providerId);
  if (!booking) return null;

  if (booking.status === 'cancelled') {
    return booking;
  }

  if (booking.status === 'completed') {
    throw createHttpError('Completed bookings cannot be cancelled');
  }

  if (booking.slotsDeducted) {
    await tx.tours.update({
      where: { id: booking.tourId },
      data: {
        availableSlots: { increment: Number(booking.numberOfPeople || 0) },
      },
    });
  }

  const updatedBooking = await tx.bookings.update({
    where: { id: booking.id },
    data: { status: 'cancelled', slotsDeducted: false },
    include: { Tours: true },
  });

  if (notifyUser) {
    await createBookingStatusNotification(tx, updatedBooking, 'cancelled');
  }

  return updatedBooking;
};

const createBooking = async ({
  userId,
  tourId,
  fullName,
  phone,
  numberOfPeople,
  departureDate,
  note,
}) => {
  const tour = await prisma.tours.findFirst({
    where: {
      id: tourId,
      status: 'approved',
    },
  });

  if (!tour) {
    return null;
  }

  const peopleCount = Number(numberOfPeople);
  if (!Number.isInteger(peopleCount) || peopleCount <= 0) {
    throw createHttpError('Number of people must be a positive whole number');
  }

  if (Number(tour.availableSlots || 0) < peopleCount) {
    throw createHttpError('Not enough available slots for this tour');
  }

  const totalPrice = Number(tour.price) * peopleCount;

  const commissionRate = Number(tour.commissionRate) || 0.1;
  const commissionAmount = totalPrice * commissionRate;
  const providerAmount = totalPrice - commissionAmount;

  return await prisma.bookings.create({
    data: {
      userId,
      tourId,
      fullName,
      phone,
      numberOfPeople: peopleCount,
      departureDate: departureDate ? new Date(departureDate) : null,
      totalPrice,
      commissionAmount,
      providerAmount,
      slotsDeducted: false,
      note: note || '',
      status: 'pending',
      Payments: {
        create: {
          userId,
          amount: totalPrice,
          method: 'bank_transfer',
          status: 'pending',
          note: 'Waiting for customer payment confirmation',
        },
      },
    },
    include: {
      Payments: true,
    },
  });
};

const getMyBookings = async (userId) => {
  const bookings = await prisma.bookings.findMany({
    where: { userId },
    include: { Tours: true },
    orderBy: { createdAt: 'desc' },
  });

  return bookings.map((b) => ({
    ...b,
    numPeople: b.numberOfPeople,
    tourTitle: b.Tours?.title,
    tourLocation: b.Tours?.location,
    tourImage: b.Tours?.image,
    tourDuration: b.Tours?.duration,
    tourStartDate: b.Tours?.startDate,
    tourEndDate: b.Tours?.endDate,
    tourPrice: b.Tours?.price,
    tourAvailableSlots: b.Tours?.availableSlots,
  }));
};

const getAllBookings = async () => {
  const bookings = await prisma.bookings.findMany({
    include: {
      Users: true,
      Tours: {
        include: {
          Users: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings.map((b) => ({
    ...b,
    userName: b.Users?.fullName,
    userEmail: b.Users?.email,
    userPhone: b.Users?.phone,
    tourTitle: b.Tours?.title,
    tourLocation: b.Tours?.location,
    tourAvailableSlots: b.Tours?.availableSlots,
    providerName: b.Tours?.Users?.fullName,
    providerEmail: b.Tours?.Users?.email,
  }));
};

const getProviderBookings = async (providerId) => {
  const bookings = await prisma.bookings.findMany({
    where: {
      Tours: { providerId },
    },
    include: {
      Tours: true,
      Users: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings.map((b) => ({
    ...b,
    tourTitle: b.Tours?.title,
    tourLocation: b.Tours?.location,
    tourImage: b.Tours?.image,
    tourPrice: b.Tours?.price,
    tourAvailableSlots: b.Tours?.availableSlots,
    userName: b.Users?.fullName,
    userEmail: b.Users?.email,
    userPhone: b.Users?.phone,
    numPeople: b.numberOfPeople,
  }));
};

const updateBookingStatus = async (id, status) => {
  if (status === 'confirmed') {
    return await prisma.$transaction((tx) =>
      confirmBookingWithSlotDeduction(tx, Number(id))
    );
  }

  if (status === 'cancelled') {
    return await prisma.$transaction((tx) =>
      cancelBookingWithSlotRestore(tx, Number(id), undefined, true)
    );
  }

  return await prisma.bookings.update({
    where: { id: Number(id) },
    data: { status },
  });
};

const cancelMyBooking = async (id, userId) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.bookings.findFirst({
      where: { id: Number(id), userId },
    });

    if (!booking) return null;

    return await cancelBookingWithSlotRestore(tx, booking.id);
  });
};

const confirmBooking = async (id, providerId) => {
  return await prisma.$transaction((tx) =>
    confirmBookingWithSlotDeduction(tx, Number(id), providerId)
  );
};

const rejectBooking = async (id, providerId) => {
  return await prisma.$transaction((tx) =>
    cancelBookingWithSlotRestore(tx, Number(id), providerId, true)
  );
};

const completeBooking = async (id, providerId) => {
  return await prisma.$transaction(async (tx) => {
    let booking = await tx.bookings.findFirst({
      where: {
        id: Number(id),
        ...(providerId ? { Tours: { providerId } } : {}),
      },
      include: { Tours: true, Payments: true, Payouts: true },
    });

    if (!booking) return null;

    if (booking.status === 'pending') {
      throw createHttpError('Booking must be confirmed before completion');
    }

    if (booking.status === 'cancelled') {
      throw createHttpError('Cancelled bookings cannot be completed');
    }

    if (!booking.Payments.some((payment) => payment.status === 'paid')) {
      throw createHttpError('Booking payment must be paid before completion');
    }

    if (!booking.slotsDeducted) {
      await deductSlotsForBooking(tx, booking);
      booking = await tx.bookings.findFirst({
        where: {
          id: Number(id),
          ...(providerId ? { Tours: { providerId } } : {}),
        },
        include: { Tours: true, Payments: true, Payouts: true },
      });
    }

    const completedBooking = await tx.bookings.update({
      where: { id: Number(id) },
      data: { status: 'completed', slotsDeducted: true },
      include: { Tours: true },
    });

    await createBookingStatusNotification(tx, completedBooking, 'completed');

    if (booking?.Tours?.providerId && booking.Payouts.length === 0) {
      await tx.payouts.create({
        data: {
          bookingId: booking.id,
          providerId: booking.Tours.providerId,
          amount: booking.totalPrice || 0,
          commissionAmount: booking.commissionAmount || 0,
          providerAmount: booking.providerAmount || 0,
          status: 'pending',
        },
      });
    }

    return completedBooking;
  });
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelMyBooking,
  confirmBooking,
  rejectBooking,
  completeBooking,
  confirmBookingWithSlotDeduction,
  cancelBookingWithSlotRestore,
};
