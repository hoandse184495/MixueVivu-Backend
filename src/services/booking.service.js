const { prisma } = require('../config/db');

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

  const totalPrice = Number(tour.price) * Number(numberOfPeople);

  const commissionRate = Number(tour.commissionRate) || 0.1;
  const commissionAmount = totalPrice * commissionRate;
  const providerAmount = totalPrice - commissionAmount;

  return await prisma.bookings.create({
    data: {
      userId,
      tourId,
      fullName,
      phone,
      numberOfPeople,
      departureDate: departureDate ? new Date(departureDate) : null,
      totalPrice,
      commissionAmount,
      providerAmount,
      note: note || '',
      status: 'pending',
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
    tourPrice: b.Tours?.price,
    userName: b.Users?.fullName,
    userEmail: b.Users?.email,
    userPhone: b.Users?.phone,
    numPeople: b.numberOfPeople,
  }));
};

const updateBookingStatus = async (id, status) => {
  return await prisma.bookings.update({
    where: { id },
    data: { status },
  });
};

const cancelMyBooking = async (id, userId) => {
  const booking = await prisma.bookings.findFirst({
    where: { id, userId },
  });

  if (!booking) return null;

  return await prisma.bookings.update({
    where: { id },
    data: { status: 'cancelled' },
  });
};

const confirmBooking = async (id, providerId) => {
  const booking = await prisma.bookings.findFirst({
    where: { id, Tours: { providerId } },
  });

  if (!booking) return null;

  return await prisma.bookings.update({
    where: { id },
    data: { status: 'confirmed' },
  });
};

const rejectBooking = async (id, providerId) => {
  const booking = await prisma.bookings.findFirst({
    where: { id, Tours: { providerId } },
  });

  if (!booking) return null;

  return await prisma.bookings.update({
    where: { id },
    data: { status: 'cancelled' },
  });
};

const completeBooking = async (id, providerId) => {
  const booking = await prisma.bookings.findFirst({
    where: { id, Tours: { providerId } },
  });

  if (!booking) return null;

  return await prisma.bookings.update({
    where: { id },
    data: { status: 'completed' },
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
};
