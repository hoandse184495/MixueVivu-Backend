const { prisma } = require("../config/db");

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
    include: { Users: true },
    orderBy: { createdAt: 'desc' },
  });

  return tours.map((t) => ({
    ...t,
    providerName: t.Users?.fullName,
    providerEmail: t.Users?.email,
  }));
};

const getTourById = async (id) => {
  const tour = await prisma.tours.findUnique({
    where: { id },
    include: {
      Users: true,
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
    activities: tour.TourActivities,
    reviews: tour.Reviews.map((r) => ({
      ...r,
      userName: r.Users?.fullName,
    })),
  };
};

const createTour = async (tourData, providerId) => {
  return await prisma.tours.create({
    data: {
      title: tourData.title,
      location: tourData.location,
      price: tourData.price,
      duration: tourData.duration || '',
      image: tourData.image || '',
      description: tourData.description || '',
      category: tourData.category || '',
      availableSlots: tourData.availableSlots || 0,
      startDate: tourData.startDate ? new Date(tourData.startDate) : null,
      endDate: tourData.endDate ? new Date(tourData.endDate) : null,
      providerId,
      commissionRate: tourData.commissionRate || 0.1,
      status: 'pending',
    },
  });
};

const updateTour = async (id, tourData) => {
  return await prisma.tours.update({
    where: { id },
    data: {
      title: tourData.title,
      location: tourData.location,
      price: tourData.price,
      duration: tourData.duration || '',
      image: tourData.image || '',
      description: tourData.description || '',
      category: tourData.category || '',
      availableSlots: tourData.availableSlots || 0,
      startDate: tourData.startDate ? new Date(tourData.startDate) : null,
      endDate: tourData.endDate ? new Date(tourData.endDate) : null,
      commissionRate: tourData.commissionRate || 0.1,
    },
  });
};

const deleteTour = async (id) => {
  return await prisma.tours.delete({ where: { id } });
};

const addReview = async ({ userId, tourId, rating, comment }) => {
  const review = await prisma.reviews.create({
    data: { userId, tourId, rating, comment: comment || '' },
  });

  const aggr = await prisma.reviews.aggregate({
    where: { tourId },
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
    orderBy: { createdAt: 'desc' },
  });
  return tours.map((t) => ({
    ...t,
  }));
};

const getPendingTours = async () => {
  const tours = await prisma.tours.findMany({
    where: { status: 'pending' },
    include: { Users: true },
    orderBy: { createdAt: 'desc' },
  });
  return tours.map((t) => ({
    ...t,
    providerName: t.Users?.fullName,
    providerEmail: t.Users?.email,
  }));
};

const approveTour = async (id) => {
  return await prisma.tours.update({
    where: { id },
    data: { status: 'approved', rejectReason: null },
  });
};

const rejectTour = async (id, rejectReason) => {
  return await prisma.tours.update({
    where: { id },
    data: { status: 'rejected', rejectReason: rejectReason || '' },
  });
};

const hideTour = async (id) => {
  return await prisma.tours.update({
    where: { id },
    data: { status: 'hidden' },
  });
};

const completeTour = async (id, providerId) => {
  const tour = await prisma.tours.findFirst({
    where: { id, providerId },
  });
  if (!tour) return null;

  return await prisma.tours.update({
    where: { id },
    data: { status: 'completed' },
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
  hideTour,
  completeTour,
};
