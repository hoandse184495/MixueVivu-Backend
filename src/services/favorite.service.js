const { sql, getPool } = require('../config/db');

const getMyFavorites = async (userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT 
        f.id AS favoriteId,
        f.createdAt AS favoriteCreatedAt,
        t.*
      FROM Favorites f
      JOIN Tours t ON f.tourId = t.id
      WHERE f.userId = @userId
      ORDER BY f.createdAt DESC
    `);

  return result.recordset;
};

const addFavorite = async (userId, tourId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('tourId', sql.Int, tourId)
    .query(`
      IF NOT EXISTS (
        SELECT 1 FROM Favorites
        WHERE userId = @userId AND tourId = @tourId
      )
      BEGIN
        INSERT INTO Favorites (userId, tourId)
        OUTPUT INSERTED.*
        VALUES (@userId, @tourId)
      END
      ELSE
      BEGIN
        SELECT *
        FROM Favorites
        WHERE userId = @userId AND tourId = @tourId
      END
    `);

  return result.recordset[0];
};

const removeFavorite = async (userId, tourId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('tourId', sql.Int, tourId)
    .query(`
      DELETE FROM Favorites
      OUTPUT DELETED.*
      WHERE userId = @userId AND tourId = @tourId
    `);

  return result.recordset[0];
};

const checkFavorite = async (userId, tourId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('tourId', sql.Int, tourId)
    .query(`
      SELECT *
      FROM Favorites
      WHERE userId = @userId AND tourId = @tourId
    `);

  return result.recordset[0];
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};