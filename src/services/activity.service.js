const { sql, getPool } = require('../config/db');

const getActivitiesByTourId = async (tourId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('tourId', sql.Int, tourId)
    .query(`
      SELECT *
      FROM TourActivities
      WHERE tourId = @tourId
      ORDER BY id ASC
    `);

  return result.recordset;
};

const getActivityById = async (id) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT *
      FROM TourActivities
      WHERE id = @id
    `);

  return result.recordset[0];
};

const createActivity = async (activityData) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('tourId', sql.Int, activityData.tourId)
    .input('title', sql.NVarChar, activityData.title)
    .input('activityTime', sql.NVarChar, activityData.activityTime || '')
    .input('location', sql.NVarChar, activityData.location || '')
    .input('description', sql.NVarChar, activityData.description || '')
    .input('image', sql.NVarChar, activityData.image || '')
    .query(`
      INSERT INTO TourActivities
      (
        tourId, title, activityTime, location, description, image
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @tourId, @title, @activityTime, @location, @description, @image
      )
    `);

  return result.recordset[0];
};

const updateActivity = async (id, activityData) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('title', sql.NVarChar, activityData.title)
    .input('activityTime', sql.NVarChar, activityData.activityTime || '')
    .input('location', sql.NVarChar, activityData.location || '')
    .input('description', sql.NVarChar, activityData.description || '')
    .input('image', sql.NVarChar, activityData.image || '')
    .query(`
      UPDATE TourActivities
      SET
        title = @title,
        activityTime = @activityTime,
        location = @location,
        description = @description,
        image = @image
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

const deleteActivity = async (id) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      DELETE FROM TourActivities
      OUTPUT DELETED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

module.exports = {
  getActivitiesByTourId,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};