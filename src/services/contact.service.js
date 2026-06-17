const { sql, getPool } = require('../config/db');

const createContact = async ({ userId, subject, message }) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('subject', sql.NVarChar, subject)
    .input('message', sql.NVarChar, message)
    .query(`
      INSERT INTO Contacts (userId, subject, message, status)
      OUTPUT INSERTED.*
      VALUES (@userId, @subject, @message, 'pending')
    `);

  return result.recordset[0];
};

const getMyContacts = async (userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT *
      FROM Contacts
      WHERE userId = @userId
      ORDER BY createdAt DESC
    `);

  return result.recordset;
};

const getAllContacts = async () => {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT 
      c.*,
      u.fullName AS userName,
      u.email AS userEmail,
      u.phone AS userPhone
    FROM Contacts c
    JOIN Users u ON c.userId = u.id
    ORDER BY c.createdAt DESC
  `);

  return result.recordset;
};

const replyContact = async ({ id, reply, status }) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('reply', sql.NVarChar, reply || '')
    .input('status', sql.NVarChar, status || 'replied')
    .query(`
      UPDATE Contacts
      SET
        reply = @reply,
        status = @status
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0];
};

module.exports = {
  createContact,
  getMyContacts,
  getAllContacts,
  replyContact,
};