const { sql, getPool } = require('../config/db');

/*
  User chỉ xem tour đã được manager duyệt: status = approved
*/
const getAllTours = async ({ search, location, category, minPrice, maxPrice }) => {
  const pool = getPool();

  const request = pool.request();

  let query = `
    SELECT 
      t.*,
      g.fullName AS guideName,
      g.phone AS guidePhone,
      g.email AS guideEmail,
      g.experience AS guideExperience,
      g.language AS guideLanguage,
      g.rating AS guideRating,
      u.fullName AS providerName,
      u.email AS providerEmail
    FROM Tours t
    LEFT JOIN Guides g ON t.guideId = g.id
    LEFT JOIN Users u ON t.providerId = u.id
    WHERE t.status = 'approved'
  `;

  if (search) {
    query += ` AND t.title LIKE @search`;
    request.input('search', sql.NVarChar, `%${search}%`);
  }

  if (location) {
    query += ` AND t.location LIKE @location`;
    request.input('location', sql.NVarChar, `%${location}%`);
  }

  if (category) {
    query += ` AND t.category = @category`;
    request.input('category', sql.NVarChar, category);
  }

  if (minPrice) {
    query += ` AND t.price >= @minPrice`;
    request.input('minPrice', sql.Decimal(18, 2), Number(minPrice));
  }

  if (maxPrice) {
    query += ` AND t.price <= @maxPrice`;
    request.input('maxPrice', sql.Decimal(18, 2), Number(maxPrice));
  }

  query += ` ORDER BY t.createdAt DESC`;

  const result = await request.query(query);

  return result.recordset;
};

/*
  Lấy chi tiết tour, bao gồm guide, provider, activities, reviews
*/
const getTourById = async (id) => {
  const pool = getPool();

  const tourResult = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT 
        t.*,
        g.fullName AS guideName,
        g.phone AS guidePhone,
        g.email AS guideEmail,
        g.experience AS guideExperience,
        g.language AS guideLanguage,
        g.rating AS guideRating,
        u.fullName AS providerName,
        u.email AS providerEmail
      FROM Tours t
      LEFT JOIN Guides g ON t.guideId = g.id
      LEFT JOIN Users u ON t.providerId = u.id
      WHERE t.id = @id
    `);

  const tour = tourResult.recordset[0];

  if (!tour) {
    return null;
  }

  const activitiesResult = await pool
    .request()
    .input('tourId', sql.Int, id)
    .query(`
      SELECT *
      FROM TourActivities
      WHERE tourId = @tourId
      ORDER BY id ASC
    `);

  const reviewsResult = await pool
    .request()
    .input('tourId', sql.Int, id)
    .query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.createdAt,
        u.fullName
      FROM Reviews r
      JOIN Users u ON r.userId = u.id
      WHERE r.tourId = @tourId
      ORDER BY r.createdAt DESC
    `);

  tour.activities = activitiesResult.recordset;
  tour.reviews = reviewsResult.recordset;

  return tour;
};

/*
  Provider tạo tour.
  Tour mới luôn là pending, chờ manager duyệt.
*/
const createTour = async (tourData, providerId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('title', sql.NVarChar, tourData.title)
    .input('location', sql.NVarChar, tourData.location)
    .input('price', sql.Decimal(18, 2), tourData.price)
    .input('duration', sql.NVarChar, tourData.duration || '')
    .input('image', sql.NVarChar, tourData.image || '')
    .input('description', sql.NVarChar, tourData.description || '')
    .input('category', sql.NVarChar, tourData.category || '')
    .input('availableSlots', sql.Int, tourData.availableSlots || 0)
    .input('startDate', sql.Date, tourData.startDate || null)
    .input('endDate', sql.Date, tourData.endDate || null)
    .input('guideId', sql.Int, tourData.guideId || null)
    .input('providerId', sql.Int, providerId)
    .input('commissionRate', sql.Float, tourData.commissionRate || 0.1)
    .query(`
      INSERT INTO Tours
      (
        title, location, price, duration, image, description,
        category, availableSlots, startDate, endDate, guideId,
        providerId, status, rejectReason, commissionRate
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @title, @location, @price, @duration, @image, @description,
        @category, @availableSlots, @startDate, @endDate, @guideId,
        @providerId, 'pending', NULL, @commissionRate
      )
    `);

  return result.recordset[0];
};

/*
  Sửa tour.
  Provider hoặc manager đều có thể gọi.
  Phần kiểm tra "provider chỉ sửa tour của mình" mình sẽ thêm sau nếu bạn muốn chặt hơn.
*/
const updateTour = async (id, tourData) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('title', sql.NVarChar, tourData.title)
    .input('location', sql.NVarChar, tourData.location)
    .input('price', sql.Decimal(18, 2), tourData.price)
    .input('duration', sql.NVarChar, tourData.duration || '')
    .input('image', sql.NVarChar, tourData.image || '')
    .input('description', sql.NVarChar, tourData.description || '')
    .input('category', sql.NVarChar, tourData.category || '')
    .input('availableSlots', sql.Int, tourData.availableSlots || 0)
    .input('startDate', sql.Date, tourData.startDate || null)
    .input('endDate', sql.Date, tourData.endDate || null)
    .input('guideId', sql.Int, tourData.guideId || null)
    .input('commissionRate', sql.Float, tourData.commissionRate || 0.1)
    .query(`
      UPDATE Tours
      SET
        title = @title,
        location = @location,
        price = @price,
        duration = @duration,
        image = @image,
        description = @description,
        category = @category,
        availableSlots = @availableSlots,
        startDate = @startDate,
        endDate = @endDate,
        guideId = @guideId,
        commissionRate = @commissionRate
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

const deleteTour = async (id) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      DELETE FROM Tours
      OUTPUT DELETED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

const addReview = async ({ userId, tourId, rating, comment }) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('tourId', sql.Int, tourId)
    .input('rating', sql.Int, rating)
    .input('comment', sql.NVarChar, comment || '')
    .query(`
      INSERT INTO Reviews (userId, tourId, rating, comment)
      OUTPUT INSERTED.*
      VALUES (@userId, @tourId, @rating, @comment)
    `);

  await pool
    .request()
    .input('tourId', sql.Int, tourId)
    .query(`
      UPDATE Tours
      SET averageRating = (
        SELECT AVG(CAST(rating AS FLOAT))
        FROM Reviews
        WHERE tourId = @tourId
      )
      WHERE id = @tourId
    `);

  return result.recordset[0];
};

/*
  Provider xem các tour do chính mình đăng
*/
const getMyTours = async (providerId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('providerId', sql.Int, providerId)
    .query(`
      SELECT 
        t.*,
        g.fullName AS guideName
      FROM Tours t
      LEFT JOIN Guides g ON t.guideId = g.id
      WHERE t.providerId = @providerId
      ORDER BY t.createdAt DESC
    `);

  return result.recordset;
};

/*
  Manager xem danh sách tour đang chờ duyệt
*/
const getPendingTours = async () => {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT 
      t.*,
      u.fullName AS providerName,
      u.email AS providerEmail,
      g.fullName AS guideName
    FROM Tours t
    LEFT JOIN Users u ON t.providerId = u.id
    LEFT JOIN Guides g ON t.guideId = g.id
    WHERE t.status = 'pending'
    ORDER BY t.createdAt DESC
  `);

  return result.recordset;
};

/*
  Manager duyệt tour
*/
const approveTour = async (id) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE Tours
      SET 
        status = 'approved',
        rejectReason = NULL
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

/*
  Manager từ chối tour
*/
const rejectTour = async (id, rejectReason) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('rejectReason', sql.NVarChar, rejectReason || '')
    .query(`
      UPDATE Tours
      SET 
        status = 'rejected',
        rejectReason = @rejectReason
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0];
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
};