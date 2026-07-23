const bcrypt = require('bcryptjs');

require('dotenv').config();

const { prisma } = require('../src/config/db');

const password = 'Password123';

const addDays = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const upsertUser = async (data) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.users.upsert({
    where: { email: data.email },
    update: {
      ...data,
      password: hashedPassword,
      isActive: true,
    },
    create: {
      ...data,
      password: hashedPassword,
      isActive: true,
    },
  });
};

const upsertCategory = async ({ name, slug }) => {
  return await prisma.categories.upsert({
    where: { slug },
    update: { name, isActive: true },
    create: { name, slug, isActive: true },
  });
};

const upsertGuide = async (data) => {
  return await prisma.guides.upsert({
    where: { email: data.email },
    update: { ...data, isActive: true },
    create: { ...data, isActive: true },
  });
};

const upsertTourByTitle = async (data) => {
  const existing = await prisma.tours.findFirst({
    where: { title: data.title },
  });

  if (existing) {
    return await prisma.tours.update({
      where: { id: existing.id },
      data,
    });
  }

  return await prisma.tours.create({ data });
};

const ensureBooking = async ({
  userId,
  tour,
  numberOfPeople,
  status,
  paymentStatus,
  slotsDeducted = false,
  payoutStatus,
}) => {
  const totalPrice = Number(tour.price) * numberOfPeople;
  const commissionRate = Number(tour.commissionRate || 0.1);
  const commissionAmount = totalPrice * commissionRate;
  const providerAmount = totalPrice - commissionAmount;

  let booking = await prisma.bookings.findFirst({
    where: {
      userId,
      tourId: tour.id,
      status,
    },
  });

  if (!booking) {
    booking = await prisma.bookings.create({
      data: {
        userId,
        tourId: tour.id,
        fullName: 'Nguyen Van Demo',
        phone: '0900000000',
        numberOfPeople,
        departureDate: tour.startDate,
        totalPrice,
        commissionAmount,
        providerAmount,
        slotsDeducted,
        note: 'Demo booking',
        status,
        Payments: {
          create: {
            userId,
            amount: totalPrice,
            method: 'bank_transfer',
            status: paymentStatus,
            transactionId: paymentStatus === 'pending' ? null : `DEMO-${Date.now()}`,
            note: paymentStatus === 'pending'
              ? 'Waiting for customer payment confirmation'
              : 'Demo bank transfer',
            paidAt: paymentStatus === 'paid' ? new Date() : null,
          },
        },
      },
      include: { Payments: true },
    });
  } else {
    booking = await prisma.bookings.update({
      where: { id: booking.id },
      data: {
        numberOfPeople,
        totalPrice,
        commissionAmount,
        providerAmount,
        slotsDeducted,
        status,
      },
      include: { Payments: true },
    });

    const payment = booking.Payments[0];
    if (payment) {
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          amount: totalPrice,
          status: paymentStatus,
          transactionId: paymentStatus === 'pending' ? null : `DEMO-${booking.id}`,
          paidAt: paymentStatus === 'paid' ? new Date() : null,
        },
      });
    } else {
      await prisma.payments.create({
        data: {
          bookingId: booking.id,
          userId,
          amount: totalPrice,
          method: 'bank_transfer',
          status: paymentStatus,
          transactionId: paymentStatus === 'pending' ? null : `DEMO-${booking.id}`,
          paidAt: paymentStatus === 'paid' ? new Date() : null,
        },
      });
    }
  }

  if (payoutStatus && tour.providerId) {
    const existingPayout = await prisma.payouts.findFirst({
      where: { bookingId: booking.id },
    });

    const payoutData = {
      bookingId: booking.id,
      providerId: tour.providerId,
      amount: totalPrice,
      commissionAmount,
      providerAmount,
      status: payoutStatus,
      paidAt: payoutStatus === 'paid' ? new Date() : null,
      note: 'Demo payout',
    };

    if (existingPayout) {
      await prisma.payouts.update({
        where: { id: existingPayout.id },
        data: payoutData,
      });
    } else {
      await prisma.payouts.create({ data: payoutData });
    }
  }

  return booking;
};

const ensureNotification = async (data) => {
  const existing = await prisma.notifications.findFirst({
    where: {
      userId: data.userId,
      type: data.type,
      title: data.title,
    },
  });

  if (existing) return existing;
  return await prisma.notifications.create({ data });
};

const run = async () => {
  const [manager, customer, approvedProvider, pendingProvider, rejectedProvider] =
    await Promise.all([
      upsertUser({
        fullName: 'MixueVivu Manager',
        email: 'manager@mixuevivu.test',
        phone: '0900000001',
        role: 'manager',
        providerStatus: 'approved',
      }),
      upsertUser({
        fullName: 'Nguyen Van Demo',
        email: 'user@mixuevivu.test',
        phone: '0900000002',
        role: 'user',
        providerStatus: 'approved',
      }),
      upsertUser({
        fullName: 'Vivu Travel Approved',
        email: 'provider@mixuevivu.test',
        phone: '0900000003',
        role: 'provider',
        providerStatus: 'approved',
        providerRejectReason: null,
        companyName: 'Vivu Travel',
        companyAddress: 'Ho Chi Minh City',
        businessLicense: 'DEMO-APPROVED-001',
        description: 'Demo provider da duoc duyet',
      }),
      upsertUser({
        fullName: 'Pending Travel Co',
        email: 'provider.pending@mixuevivu.test',
        phone: '0900000004',
        role: 'provider',
        providerStatus: 'pending',
        providerRejectReason: '',
        companyName: 'Pending Travel Co',
        companyAddress: 'Da Nang',
        businessLicense: 'DEMO-PENDING-001',
        description: 'Demo provider cho manager duyet',
      }),
      upsertUser({
        fullName: 'Rejected Travel Co',
        email: 'provider.rejected@mixuevivu.test',
        phone: '0900000005',
        role: 'provider',
        providerStatus: 'rejected',
        providerRejectReason: 'Thieu giay phep kinh doanh hop le',
        companyName: 'Rejected Travel Co',
        companyAddress: 'Ha Noi',
        businessLicense: 'DEMO-REJECTED-001',
        description: 'Demo provider bi tu choi',
      }),
    ]);

  const [mountainCategory, seaCategory] = await Promise.all([
    upsertCategory({ name: 'Nui', slug: 'demo-nui' }),
    upsertCategory({ name: 'Bien', slug: 'demo-bien' }),
  ]);

  const guide = await upsertGuide({
    fullName: 'Tran Thi Guide',
    email: 'guide@mixuevivu.test',
    phone: '0900000006',
    experience: '5 nam dan tour mien Bac va mien Trung',
    language: 'Vietnamese, English',
    rating: 4.8,
    avatar: '',
  });

  const approvedTour = await upsertTourByTitle({
    title: 'Demo Tour Da Nang 3 ngay 2 dem',
    location: 'Da Nang',
    price: 3200000,
    duration: '3 ngay 2 dem',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    description: 'Tour demo da duoc duyet de user dat va thanh toan.',
    category: seaCategory.name,
    categoryId: seaCategory.id,
    availableSlots: 18,
    startDate: addDays(20),
    endDate: addDays(22),
    providerId: approvedProvider.id,
    guideId: guide.id,
    status: 'approved',
    rejectReason: null,
    commissionRate: 0.1,
  });

  const pendingTour = await upsertTourByTitle({
    title: 'Demo Tour Sapa Cho Duyet',
    location: 'Sapa',
    price: 2800000,
    duration: '2 ngay 1 dem',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    description: 'Tour demo dang cho manager duyet.',
    category: mountainCategory.name,
    categoryId: mountainCategory.id,
    availableSlots: 12,
    startDate: addDays(30),
    endDate: addDays(31),
    providerId: approvedProvider.id,
    guideId: guide.id,
    status: 'pending',
    rejectReason: null,
    commissionRate: 0.1,
  });

  await upsertTourByTitle({
    title: 'Demo Tour Bi Tu Choi',
    location: 'Nha Trang',
    price: 2500000,
    duration: '2 ngay 1 dem',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    description: 'Tour demo de provider sua va gui lai.',
    category: seaCategory.name,
    categoryId: seaCategory.id,
    availableSlots: 10,
    startDate: addDays(40),
    endDate: addDays(41),
    providerId: approvedProvider.id,
    guideId: guide.id,
    status: 'rejected',
    rejectReason: 'Mo ta tour chua du thong tin lich trinh',
    commissionRate: 0.1,
  });

  await ensureBooking({
    userId: customer.id,
    tour: approvedTour,
    numberOfPeople: 2,
    status: 'pending',
    paymentStatus: 'pending',
  });

  await ensureBooking({
    userId: customer.id,
    tour: approvedTour,
    numberOfPeople: 1,
    status: 'confirmed',
    paymentStatus: 'submitted',
    slotsDeducted: true,
  });

  await ensureBooking({
    userId: customer.id,
    tour: approvedTour,
    numberOfPeople: 3,
    status: 'completed',
    paymentStatus: 'paid',
    slotsDeducted: true,
    payoutStatus: 'pending',
  });

  await Promise.all([
    ensureNotification({
      userId: customer.id,
      type: 'demo_flow',
      title: 'Du lieu demo da san sang',
      message: 'Hay vao Booking va Thanh toan de xem cac trang thai mau.',
      status: 'info',
    }),
    ensureNotification({
      userId: approvedProvider.id,
      type: 'demo_flow',
      title: 'Provider demo da co booking',
      message: 'Hay vao tab Bookings de xac nhan hoac tu choi booking pending.',
      status: 'info',
    }),
    ensureNotification({
      userId: manager.id,
      type: 'demo_flow',
      title: 'Manager demo da co viec can xu ly',
      message: 'Hay duyet provider/tour, xac nhan payment va payout.',
      status: 'info',
    }),
    ensureNotification({
      userId: pendingProvider.id,
      type: 'provider_pending',
      title: 'Tai khoan dang cho duyet',
      message: 'Manager se kiem tra thong tin cong ty cua ban.',
      status: 'pending',
    }),
    ensureNotification({
      userId: rejectedProvider.id,
      type: 'provider_rejected',
      title: 'Tai khoan provider bi tu choi',
      message: 'Ly do: Thieu giay phep kinh doanh hop le.',
      status: 'rejected',
    }),
  ]);

  console.log('Demo seed completed');
  console.log('Accounts:');
  console.log(`- manager@mixuevivu.test / ${password}`);
  console.log(`- user@mixuevivu.test / ${password}`);
  console.log(`- provider@mixuevivu.test / ${password}`);
  console.log(`- provider.pending@mixuevivu.test / ${password}`);
  console.log(`- provider.rejected@mixuevivu.test / ${password}`);
  console.log(`Demo pending tour: ${pendingTour.title}`);
};

run()
  .catch((error) => {
    console.error('Demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
