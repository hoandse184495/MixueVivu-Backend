const { sql, getPool } = require('../config/db');

const findUserByEmail = async (email) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('email', sql.NVarChar, email)
    .query(`
      SELECT TOP 1 *
      FROM Users
      WHERE email = @email
    `);

  return result.recordset[0];
};

const findUserById = async (id) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT id, fullName, email, phone, avatar, role, createdAt
      FROM Users
      WHERE id = @id
    `);

  return result.recordset[0];
};

const getUserStats = async (userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT
        (SELECT COUNT(*) FROM Bookings WHERE userId = @userId) AS bookings,
        (SELECT COUNT(*) FROM Favorites WHERE userId = @userId) AS favorites,
        (SELECT COUNT(*) FROM Reviews WHERE userId = @userId) AS reviews
    `);

  const stats = result.recordset[0] || {};
  return {
    bookings: stats.bookings || 0,
    favorites: stats.favorites || 0,
    reviews: stats.reviews || 0,
  };
};

const updateUserProfile = async (id, { fullName, phone, avatar }) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('fullName', sql.NVarChar, fullName)
    .input('phone', sql.NVarChar, phone || '')
    .input('avatar', sql.NVarChar, avatar || '')
    .query(`
      UPDATE Users
      SET fullName = @fullName,
          phone = @phone,
          avatar = @avatar
      OUTPUT INSERTED.id, INSERTED.fullName, INSERTED.email, INSERTED.phone,
             INSERTED.avatar, INSERTED.role, INSERTED.createdAt
      WHERE id = @id
    `);

  return result.recordset[0];
};

const createUser = async ({ fullName, email, password, phone }) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('fullName', sql.NVarChar, fullName)
    .input('email', sql.NVarChar, email)
    .input('password', sql.NVarChar, password)
    .input('phone', sql.NVarChar, phone || '')
    .query(`
      INSERT INTO Users (fullName, email, password, phone, role)
      OUTPUT INSERTED.id, INSERTED.fullName, INSERTED.email, INSERTED.phone, INSERTED.role
      VALUES (@fullName, @email, @password, @phone, 'user')
    `);

  return result.recordset[0];
};

const createRefreshToken = async ({ userId, tokenHash, expiresAt }) => {
  const pool = getPool();

  await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('tokenHash', sql.Char(64), tokenHash)
    .input('expiresAt', sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO RefreshTokens (userId, tokenHash, expiresAt)
      VALUES (@userId, @tokenHash, @expiresAt)
    `);
};

const consumeRefreshToken = async (tokenHash) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('tokenHash', sql.Char(64), tokenHash)
    .query(`
      DELETE FROM RefreshTokens
      OUTPUT DELETED.userId
      WHERE tokenHash = @tokenHash
        AND expiresAt > SYSUTCDATETIME()
    `);

  const consumedToken = result.recordset[0];
  return consumedToken ? findUserById(consumedToken.userId) : undefined;
};

const revokeRefreshToken = async (tokenHash) => {
  const pool = getPool();

  await pool
    .request()
    .input('tokenHash', sql.Char(64), tokenHash)
    .query(`DELETE FROM RefreshTokens WHERE tokenHash = @tokenHash`);
};

module.exports = {
  findUserByEmail,
  findUserById,
  getUserStats,
  updateUserProfile,
  createUser,
  createRefreshToken,
  consumeRefreshToken,
  revokeRefreshToken,
};
