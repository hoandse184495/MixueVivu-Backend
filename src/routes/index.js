const express = require('express');

const authRoutes = require('./auth.routes');
const tourRoutes = require('./tour.routes');
const bookingRoutes = require('./booking.routes');
const guideRoutes = require('./guide.routes');
const activityRoutes = require('./activity.routes');
const favoriteRoutes = require('./favorite.routes');
const contactRoutes = require('./contact.routes');
const friendRoutes = require('./friend.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tours', tourRoutes);
router.use('/bookings', bookingRoutes);
router.use('/guides', guideRoutes);
router.use('/activities', activityRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/contacts', contactRoutes);
router.use('/friends', friendRoutes);

module.exports = router;