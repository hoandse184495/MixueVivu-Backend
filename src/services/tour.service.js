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

const createHttpError = (message, statusCode = 400) =>
  Object.assign(new Error(message), { statusCode });

const validateTourPayload = (tourData) => {
  const requiredFields = ['title', 'location', 'price', 'duration', 'description', 'availableSlots', 'startDate', 'endDate', 'image'];
  const missingField = requiredFields.find((field) => {
    const value = tourData[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missingField) {
    throw createHttpError('Vui lòng điền đầy đủ các thông tin bắt buộc của tour');
  }

  const title = String(tourData.title).trim();
  const location = String(tourData.location).trim();
  const duration = String(tourData.duration).trim();
  const description = String(tourData.description).trim();

  if (title.length < 5) {
    throw createHttpError('Tên tour phải có ít nhất 5 ký tự');
  }

  if (location.length < 2) {
    throw createHttpError('Địa điểm phải có ít nhất 2 ký tự');
  }

  if (duration.length < 3) {
    throw createHttpError('Thời lượng tour chưa hợp lệ');
  }

  if (description.length < 20) {
    throw createHttpError('Mô tả tour phải có ít nhất 20 ký tự');
  }

  if (!tourData.categoryId && !String(tourData.category || '').trim()) {
    throw createHttpError('Vui lòng chọn danh mục tour');
  }

  const price = Number(tourData.price);
  const availableSlots = Number(tourData.availableSlots);

  if (!Number.isFinite(price) || price <= 0) {
    throw createHttpError('Giá tiền phải là số lớn hơn 0');
  }

  if (!Number.isInteger(availableSlots) || availableSlots <= 0) {
    throw createHttpError('Số lượng khách nhận phải là số nguyên lớn hơn 0');
  }

  const parseDate = (value, fieldName) => {
    if (!value) throw createHttpError(`${fieldName} là bắt buộc`);

    const textValue = String(value).slice(0, 10);
    const parsedDate = new Date(`${textValue}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(textValue) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== textValue
    ) {
      throw createHttpError(`${fieldName} phải có định dạng YYYY-MM-DD`);
    }

    return parsedDate;
  };

  const startDate = parseDate(tourData.startDate, 'Ngày bắt đầu');
  const endDate = parseDate(tourData.endDate, 'Ngày kết thúc');
  const today = new Date();
  const minStartDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  minStartDate.setUTCDate(minStartDate.getUTCDate() + 7);

  if (startDate < minStartDate) {
    throw createHttpError('Ngày bắt đầu tour phải cách ngày hiện tại ít nhất 7 ngày mới được gửi admin duyệt.');
  }

  if (startDate > endDate) {
    throw createHttpError('Ngày bắt đầu không được sau ngày kết thúc');
  }

  const image = typeof tourData.image === 'string' ? tourData.image.trim() : '';
  if (!/^https?:\/\/\S+$/i.test(image) || image.length > 2048) {
    throw createHttpError('Ảnh nền tour phải là URL http(s) hợp lệ và không quá 2048 ký tự');
  }

  return { price, availableSlots, startDate, endDate, image, title, location, duration, description };
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
  const validated = validateTourPayload(tourData);
  const categoryId = tourData.categoryId ? Number(tourData.categoryId) : null;
  const selectedCategory = categoryId
    ? await prisma.categories.findUnique({ where: { id: categoryId } })
    : null;
  if (categoryId && !selectedCategory) {
    throw createHttpError('Danh mục tour không hợp lệ');
  }

  return await prisma.$transaction(async (tx) => {
    const tour = await tx.tours.create({
      data: {
        title: validated.title,
        location: validated.location,
        price: validated.price,
        duration: validated.duration,
        image: validated.image || '',
        description: validated.description,
        category: selectedCategory?.name || tourData.category || '',
        categoryId,
        availableSlots: validated.availableSlots,
        startDate: validated.startDate,
        endDate: validated.endDate,
        providerId,
        guideId: tourData.guideId ? Number(tourData.guideId) : null,
        commissionRate: tourData.commissionRate || 0.1,
        status: 'pending',
      },
    });

    await notificationService.createManagerNotification(
      {
        tourId: tour.id,
        type: 'admin_tour_pending',
        title: 'Tour mới chờ duyệt',
        message: `Provider vừa gửi tour ${tour.title}. Vào Duyệt Tour để kiểm tra.`,
        status: 'pending',
      },
      tx
    );

    return tour;
  });
};

const updateTour = async (id, tourData, user) => {
  const validated = validateTourPayload(tourData);
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
  if (categoryId && !selectedCategory) {
    throw createHttpError('Danh mục tour không hợp lệ');
  }

  const data = {
    title: validated.title,
    location: validated.location,
    price: validated.price,
    duration: validated.duration,
    image: validated.image || '',
    description: validated.description,
    category: selectedCategory?.name || tourData.category || '',
    categoryId,
    availableSlots: validated.availableSlots,
    startDate: validated.startDate,
    endDate: validated.endDate,
    guideId: tourData.guideId ? Number(tourData.guideId) : null,
    commissionRate: tourData.commissionRate || 0.1,
  };

  if (user?.role === 'provider' && tour.status === 'rejected') {
    data.status = 'pending';
    data.rejectReason = null;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedTour = await tx.tours.update({
      where: { id: Number(id) },
      data,
    });

    if (user?.role === 'provider' && tour.status === 'rejected') {
      await notificationService.createManagerNotification(
        {
          tourId: updatedTour.id,
          type: 'admin_tour_resubmitted',
          title: 'Tour đã được gửi lại',
          message: `Provider đã sửa và gửi lại tour ${updatedTour.title}. Vào Duyệt Tour để xét duyệt.`,
          status: 'pending',
        },
        tx
      );
    }

    return updatedTour;
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

  const bookingCount = await prisma.bookings.count({
    where: { tourId: Number(id) },
  });

  if (bookingCount > 0) {
    throw createHttpError(
      'Tour đã có người booking nên không thể xóa. Bạn chỉ có thể xóa tour chưa có booking.',
      400
    );
  }

  return await prisma.$transaction(async (tx) => {
    await tx.favorites.deleteMany({ where: { tourId: Number(id) } });
    await tx.reviews.deleteMany({ where: { tourId: Number(id) } });

    return tx.tours.delete({ where: { id: Number(id) } });
  });
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
      [
        createTourStatusNotification(tx, updatedTour, 'completed', tour.providerId),
        ...bookings.map((booking) =>
          createTourStatusNotification(tx, updatedTour, 'completed', booking.userId)
        ),
      ]
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
