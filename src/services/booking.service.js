const { sql, getPool } = require('../config/db');

const createBooking = async ({
  userId,
  tourId,
  fullName,
  phone,
  numberOfPeople,
  departureDate,
  note,
}) => {
  const pool = getPool();

  const tourResult = await pool
    .request()
    .input('tourId', sql.Int, tourId)
    .query(`
      SELECT *
      FROM Tours
      WHERE id = @tourId
        AND status = 'approved'
    `);

  const tour = tourResult.recordset[0];

  if (!tour) {
    return null;
  }

  const totalPrice = Number(tour.price) * Number(numberOfPeople);

  const commissionRate = Number(tour.commissionRate) || 0.1;
  const commissionAmount = totalPrice * commissionRate;
  const providerAmount = totalPrice - commissionAmount;

  const bookingResult = await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('tourId', sql.Int, tourId)
    .input('fullName', sql.NVarChar, fullName)
    .input('phone', sql.NVarChar, phone)
    .input('numberOfPeople', sql.Int, numberOfPeople)
    .input('departureDate', sql.Date, departureDate || null)
    .input('totalPrice', sql.Decimal(18, 2), totalPrice)
    .input('commissionAmount', sql.Decimal(18, 2), commissionAmount)
    .input('providerAmount', sql.Decimal(18, 2), providerAmount)
    .input('note', sql.NVarChar, note || '')
    .query(`
      INSERT INTO Bookings
      (
        userId, tourId, fullName, phone,
        numberOfPeople, departureDate, totalPrice,
        commissionAmount, providerAmount,
        note, status
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @userId, @tourId, @fullName, @phone,
        @numberOfPeople, @departureDate, @totalPrice,
        @commissionAmount, @providerAmount,
        @note, 'pending'
      )
    `);

  return bookingResult.recordset[0];
};

const getMyBookings = async (userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT 
        b.*,
        t.title,
        t.location,
        t.image,
        t.duration,
        t.price
      FROM Bookings b
      JOIN Tours t ON b.tourId = t.id
      WHERE b.userId = @userId
      ORDER BY b.createdAt DESC
    `);

  return result.recordset;
};

const getAllBookings = async () => {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT 
      b.*,
      u.fullName AS userName,
      u.email AS userEmail,
      u.phone AS userPhone,
      t.title AS tourTitle,
      t.location AS tourLocation,
      p.fullName AS providerName,
      p.email AS providerEmail
    FROM Bookings b
    JOIN Users u ON b.userId = u.id
    JOIN Tours t ON b.tourId = t.id
    LEFT JOIN Users p ON t.providerId = p.id
    ORDER BY b.createdAt DESC
  `);

  return result.recordset;
};

const getProviderBookings = async (providerId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('providerId', sql.Int, providerId)
    .query(`
      SELECT 
        b.*,
        t.title AS tourTitle,
        t.location AS tourLocation,
        t.image AS tourImage,
        t.price AS tourPrice,
        u.fullName AS customerName,
        u.email AS customerEmail,
        u.phone AS customerPhone
      FROM Bookings b
      JOIN Tours t ON b.tourId = t.id
      JOIN Users u ON b.userId = u.id
      WHERE t.providerId = @providerId
      ORDER BY b.createdAt DESC
    `);

  return result.recordset;
};

const updateBookingStatus = async (id, status) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('status', sql.NVarChar, status)
    .query(`
      UPDATE Bookings
      SET status = @status
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

const cancelMyBooking = async (id, userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('userId', sql.Int, userId)
    .query(`
      UPDATE Bookings
      SET status = 'cancelled'
      OUTPUT INSERTED.*
      WHERE id = @id AND userId = @userId
    `);

  return result.recordset[0];
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelMyBooking,
};