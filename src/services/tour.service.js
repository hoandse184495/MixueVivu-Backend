const { prisma } = require("../config/db");
const notificationService = require('./notification.service');

const createTourStatusNotification = async (client, tour, status, userId) => {
  if (!tour || !userId) return;

  const notifications = {
    approved: {
      title: 'Tour đã được duyệt',
      message: `Tour ${tour.title} đã được manager duyệt và hiển thị cho khách đặt.`,
    },
    rejected: {
      title: 'Tour bị từ chối',
      message: `Tour ${tour.title} đã bị từ chối. Lý do: ${tour.rejectReason || 'Chưa có lý do cụ thể'}.`,
    },
    completed: {
      title: 'Tour đã hoàn thành',
      message: `Tour ${tour.title} đã được đánh dấu hoàn thành.`,
    },
  };
  const notification = notifications[status];
  if (!notification) return;

  await notificationService.createNotification(
    {
      userId,
      tourId: tour.id,
      type: `tour_${status}`,
      status,
      ...notification,
    },
    client
  );
};

const getAllTours = async ({
  search,
  location,
  category,
  minPrice,
  maxPrice,
  startDate,
  minAvailableSlots,
}) => {
  const where = {
    status: 'approved',
  };

  if (startDate) {
    where.startDate = { gte: new Date(startDate) };
  } else {
    // Current date (no time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    where.startDate = { gte: today };
  }

  if (search) where.title = { contains: search };
  if (location) where.location = { contains: location };
  if (category) where.category = category;
  
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  if (minAvailableSlots) where.availableSlots = { gte: Number(minAvailableSlots) };

  const tours = await prisma.tours.findMany({
    where,
    include: { Users: true, Guides: true },
    orderBy: { createdAt: 'desc' },
  });

  return tours.map((t) => ({
    ...t,
    providerName: t.Users?.fullName,
    providerEmail: t.Users?.email,
    guideName: t.Guides?.fullName,
    guidePhone: t.Guides?.phone,
    guideEmail: t.Guides?.email,
    guideExperience: t.Guides?.experience,
    guideLanguage: t.Guides?.language,
    guideRating: t.Guides?.rating,
  }));
};

const getTourById = async (id) => {
  const tour = await prisma.tours.findUnique({
    where: { id },
    include: {
      Users: true,
      Guides: true,
      TourActivities: { orderBy: { id: 'asc' } },
      Reviews: {
        include: { Users: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!tour) return null;

  return {
    ...tour,
    providerName: tour.Users?.fullName,
    providerEmail: tour.Users?.email,
    guideName: tour.Guides?.fullName,
    guidePhone: tour.Guides?.phone,
    guideEmail: tour.Guides?.email,
    guideExperience: tour.Guides?.experience,
    guideLanguage: tour.Guides?.language,
    guideRating: tour.Guides?.rating,
    activities: tour.TourActivities,
    reviews: tour.Reviews.map((r) => ({
      ...r,
      userName: r.Users?.fullName,
    })),
  };
};

const createTour = async (tourData, providerId) => {
  const categoryId = tourData.categoryId ? Number(tourData.categoryId) : null;
  const selectedCategory = categoryId
    ? await prisma.categories.findUnique({ where: { id: categoryId } })
    : null;

  return await prisma.tours.create({
    data: {
      title: tourData.title,
      location: tourData.location,
      price: tourData.price,
      duration: tourData.duration || '',
      image: tourData.image || '',
      description: tourData.description || '',
      category: selectedCategory?.name || tourData.category || '',
      categoryId,
      availableSlots: tourData.availableSlots || 0,
      startDate: tourData.startDate ? new Date(tourData.startDate) : null,
      endDate: tourData.endDate ? new Date(tourData.endDate) : null,
      providerId,
      guideId: tourData.guideId ? Number(tourData.guideId) : null,
      commissionRate: tourData.commissionRate || 0.1,
      status: 'pending',
    },
  });
};

const updateTour = async (id, tourData, user) => {
  const tour = await prisma.tours.findFirst({
    where: {
      id: Number(id),
      ...(user?.role === 'provider' ? { providerId: user.id } : {}),
    },
  });

  if (!tour) return null;

  const categoryId = tourData.categoryId ? Number(tourData.categoryId) : null;
  const selectedCategory = categoryId
    ? await prisma.categories.findUnique({ where: { id: categoryId } })
    : null;

  const data = {
    title: tourData.title,
    location: tourData.location,
    price: tourData.price,
    duration: tourData.duration || '',
    image: tourData.image || '',
    description: tourData.description || '',
    category: selectedCategory?.name || tourData.category || '',
    categoryId,
    availableSlots: tourData.availableSlots || 0,
    startDate: tourData.startDate ? new Date(tourData.startDate) : null,
    endDate: tourData.endDate ? new Date(tourData.endDate) : null,
    guideId: tourData.guideId ? Number(tourData.guideId) : null,
    commissionRate: tourData.commissionRate || 0.1,
  };

  if (user?.role === 'provider' && tour.status === 'rejected') {
    data.status = 'pending';
    data.rejectReason = null;
  }

  return await prisma.tours.update({
    where: { id: Number(id) },
    data,
  });
};

const resubmitTour = async (id, providerId) => {
  const tour = await prisma.tours.findFirst({
    where: { id: Number(id), providerId, status: 'rejected' },
  });
  if (!tour) return null;

  return await prisma.tours.update({
    where: { id: Number(id) },
    data: { status: 'pending', rejectReason: null },
  });
};

const deleteTour = async (id, user) => {
  const tour = await prisma.tours.findFirst({
    where: {
      id: Number(id),
      ...(user?.role === 'provider' ? { providerId: user.id } : {}),
    },
  });

  if (!tour) return null;

  return await prisma.tours.delete({ where: { id: Number(id) } });
};

const addReview = async ({ userId, tourId, rating, comment }) => {
  const completedBooking = await prisma.bookings.findFirst({
    where: {
      userId,
      tourId: Number(tourId),
      status: 'completed',
    },
  });

  if (!completedBooking) {
    const error = new Error('You can only review completed tours you booked');
    error.statusCode = 403;
    throw error;
  }

  const existingReview = await prisma.reviews.findFirst({
    where: { userId, tourId: Number(tourId) },
  });

  if (existingReview) {
    const error = new Error('You have already reviewed this tour');
    error.statusCode = 400;
    throw error;
  }

  const review = await prisma.reviews.create({
    data: { userId, tourId: Number(tourId), rating: Number(rating), comment: comment || '' },
  });

  const aggr = await prisma.reviews.aggregate({
    where: { tourId: Number(tourId) },
    _avg: { rating: true },
  });

  await prisma.tours.update({
    where: { id: tourId },
    data: { averageRating: aggr._avg.rating || 0 },
  });

  return review;
};

const getMyTours = async (providerId) => {
  const tours = await prisma.tours.findMany({
    where: { providerId },
    include: { Guides: true },
    orderBy: { createdAt: 'desc' },
  });
  return tours.map((t) => ({
    ...t,
    guideName: t.Guides?.fullName,
    guideEmail: t.Guides?.email,
  }));
};

const getPendingTours = async () => {
  const tours = await prisma.tours.findMany({
    where: { status: 'pending' },
    include: { Users: true, Guides: true },
    orderBy: { createdAt: 'desc' },
  });
  return tours.map((t) => ({
    ...t,
    providerName: t.Users?.fullName,
    providerEmail: t.Users?.email,
    guideName: t.Guides?.fullName,
    guideEmail: t.Guides?.email,
  }));
};

const approveTour = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const tour = await tx.tours.update({
      where: { id },
      data: { status: 'approved', rejectReason: null },
    });

    await createTourStatusNotification(tx, tour, 'approved', tour.providerId);

    return tour;
  });
};

const rejectTour = async (id, rejectReason) => {
  return await prisma.$transaction(async (tx) => {
    const tour = await tx.tours.update({
      where: { id },
      data: { status: 'rejected', rejectReason: rejectReason || '' },
    });

    await createTourStatusNotification(tx, tour, 'rejected', tour.providerId);

    return tour;
  });
};

const hideTour = async (id) => {
  return await prisma.tours.update({
    where: { id },
    data: { status: 'hidden' },
  });
};

const completeTour = async (id, providerId) => {
  return await prisma.$transaction(async (tx) => {
    const tour = await tx.tours.findFirst({
      where: { id, providerId },
    });
    if (!tour) return null;

    const updatedTour = await tx.tours.update({
      where: { id },
      data: { status: 'completed' },
    });

    const bookings = await tx.bookings.findMany({
      where: {
        tourId: id,
        status: { in: ['confirmed', 'completed'] },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    await Promise.all(
      bookings.map((booking) =>
        createTourStatusNotification(tx, updatedTour, 'completed', booking.userId)
      )
    );

    return updatedTour;
  });
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  addReview,
  getMyTours,
  getPendingTours,
  approveTour,
  rejectTour,
  resubmitTour,
  hideTour,
  completeTour,
};
