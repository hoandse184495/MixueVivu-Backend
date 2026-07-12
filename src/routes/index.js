const express = require('express');

const authRoutes = require('./auth.routes');
const tourRoutes = require('./tour.routes');
const bookingRoutes = require('./booking.routes');
const activityRoutes = require('./activity.routes');
const favoriteRoutes = require('./favorite.routes');
const contactRoutes = require('./contact.routes');
const friendRoutes = require('./friend.routes');
const categoryRoutes = require('./category.routes');
const adminRoutes = require('./admin.routes');
const paymentRoutes = require('./payment.routes');
const payoutRoutes = require('./payout.routes');
const providerRoutes = require('./provider.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tours', tourRoutes);
router.use('/bookings', bookingRoutes);
router.use('/activities', activityRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/contacts', contactRoutes);
router.use('/friends', friendRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/payouts', payoutRoutes);
router.use('/provider', providerRoutes);

module.exports = router;