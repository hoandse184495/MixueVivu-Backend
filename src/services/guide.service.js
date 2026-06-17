const { sql, getPool } = require('../config/db');

const getAllGuides = async () => {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT *
    FROM Guides
    ORDER BY createdAt DESC
  `);

  return result.recordset;
};

const getGuideById = async (id) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT *
      FROM Guides
      WHERE id = @id
    `);

  return result.recordset[0];
};

const createGuide = async (guideData) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('fullName', sql.NVarChar, guideData.fullName)
    .input('phone', sql.NVarChar, guideData.phone || '')
    .input('email', sql.NVarChar, guideData.email || '')
    .input('experience', sql.NVarChar, guideData.experience || '')
    .input('language', sql.NVarChar, guideData.language || '')
    .input('rating', sql.Float, guideData.rating || 0)
    .query(`
      INSERT INTO Guides
      (
        fullName, phone, email, experience, language, rating
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @fullName, @phone, @email, @experience, @language, @rating
      )
    `);

  return result.recordset[0];
};

const updateGuide = async (id, guideData) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('fullName', sql.NVarChar, guideData.fullName)
    .input('phone', sql.NVarChar, guideData.phone || '')
    .input('email', sql.NVarChar, guideData.email || '')
    .input('experience', sql.NVarChar, guideData.experience || '')
    .input('language', sql.NVarChar, guideData.language || '')
    .input('rating', sql.Float, guideData.rating || 0)
    .query(`
      UPDATE Guides
      SET
        fullName = @fullName,
        phone = @phone,
        email = @email,
        experience = @experience,
        language = @language,
        rating = @rating
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

const deleteGuide = async (id) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      DELETE FROM Guides
      OUTPUT DELETED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

module.exports = {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
};