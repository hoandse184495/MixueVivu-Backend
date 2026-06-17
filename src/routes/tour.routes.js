const express = require('express');

const {
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
} = require('../controllers/tour.controller');

const {
  protect,
  authorizeRoles,
} = require('../middlewares/auth.middleware');

const router = express.Router();

/*
  User xem danh sách tour đã được duyệt
*/
router.get('/', getAllTours);

/*
  Provider xem tour của chính mình
  Lưu ý: /my-tours phải đặt trước /:id
*/
router.get('/my-tours', protect, authorizeRoles('provider'), getMyTours);

/*
  Manager xem các tour đang chờ duyệt
  Lưu ý: /pending phải đặt trước /:id
*/
router.get('/pending', protect, authorizeRoles('manager'), getPendingTours);

/*
  Xem chi tiết tour
*/
router.get('/:id', getTourById);

/*
  Provider đăng tour
*/
router.post('/', protect, authorizeRoles('provider'), createTour);

/*
  Provider hoặc manager sửa tour
*/
router.put('/:id', protect, authorizeRoles('provider', 'manager'), updateTour);

/*
  Provider hoặc manager xóa tour
*/
router.delete('/:id', protect, authorizeRoles('provider', 'manager'), deleteTour);

/*
  Manager duyệt tour
*/
router.put('/:id/approve', protect, authorizeRoles('manager'), approveTour);

/*
  Manager từ chối tour
*/
router.put('/:id/reject', protect, authorizeRoles('manager'), rejectTour);

/*
  User đánh giá tour
*/
router.post('/:id/reviews', protect, authorizeRoles('user'), addReview);

module.exports = router;