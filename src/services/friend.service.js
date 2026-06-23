const { sql, getPool } = require('../config/db');

const searchUsers = async (keyword, currentUserId) => {
  const normalizedKeyword = typeof keyword === 'string' ? keyword.trim() : '';
  if (!normalizedKeyword) {
    return [];
  }

  const pool = getPool();

  const result = await pool
    .request()
    .input('keyword', sql.NVarChar, `%${normalizedKeyword}%`)
    .input('currentUserId', sql.Int, currentUserId)
    .query(`
      SELECT
        u.id,
        u.fullName,
        u.email,
        u.phone,
        u.avatar,
        u.role,
        f.status AS friendStatus,
        f.senderId AS friendSenderId,
        f.receiverId AS friendReceiverId
      FROM Users u
      LEFT JOIN Friends f
        ON (
          (f.senderId = @currentUserId AND f.receiverId = u.id)
          OR
          (f.senderId = u.id AND f.receiverId = @currentUserId)
        )
        AND f.status IN ('pending', 'accepted')
      WHERE u.id <> @currentUserId
        AND u.role = 'user'
        AND (
          u.fullName LIKE @keyword
          OR u.email LIKE @keyword
          OR u.phone LIKE @keyword
        )
      ORDER BY u.fullName ASC
    `);

  return result.recordset;
};

const getMyFriends = async (userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT 
        f.id AS friendRequestId,
        f.status,
        f.createdAt,
        u.id AS friendId,
        u.fullName AS friendName,
        u.email AS friendEmail,
        u.phone,
        u.avatar
      FROM Friends f
      JOIN Users u 
        ON (
          CASE 
            WHEN f.senderId = @userId THEN f.receiverId
            ELSE f.senderId
          END
        ) = u.id
      WHERE 
        (f.senderId = @userId OR f.receiverId = @userId)
        AND f.status = 'accepted'
      ORDER BY f.createdAt DESC
    `);

  return result.recordset;
};

const getFriendRequests = async (userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT 
        f.id AS requestId,
        f.status,
        f.createdAt,
        u.id AS senderId,
        u.fullName AS senderName,
        u.email AS senderEmail,
        u.phone,
        u.avatar
      FROM Friends f
      JOIN Users u ON f.senderId = u.id
      WHERE f.receiverId = @userId
        AND f.status = 'pending'
      ORDER BY f.createdAt DESC
    `);

  return result.recordset;
};

const sendFriendRequest = async (senderId, receiverId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('senderId', sql.Int, senderId)
    .input('receiverId', sql.Int, receiverId)
    .query(`
      IF NOT EXISTS (
        SELECT 1
        FROM Friends
        WHERE 
          (senderId = @senderId AND receiverId = @receiverId)
          OR
          (senderId = @receiverId AND receiverId = @senderId)
      )
      BEGIN
        INSERT INTO Friends (senderId, receiverId, status)
        OUTPUT INSERTED.*
        VALUES (@senderId, @receiverId, 'pending')
      END
      ELSE
      BEGIN
        SELECT TOP 1 *
        FROM Friends
        WHERE 
          (senderId = @senderId AND receiverId = @receiverId)
          OR
          (senderId = @receiverId AND receiverId = @senderId)
      END
    `);

  return result.recordset[0];
};

const acceptFriendRequest = async (requestId, userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('requestId', sql.Int, requestId)
    .input('userId', sql.Int, userId)
    .query(`
      UPDATE Friends
      SET status = 'accepted'
      OUTPUT INSERTED.*
      WHERE id = @requestId 
        AND receiverId = @userId
        AND status = 'pending'
    `);

  return result.recordset[0];
};

const rejectFriendRequest = async (requestId, userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('requestId', sql.Int, requestId)
    .input('userId', sql.Int, userId)
    .query(`
      UPDATE Friends
      SET status = 'rejected'
      OUTPUT INSERTED.*
      WHERE id = @requestId
        AND receiverId = @userId
        AND status = 'pending'
    `);

  return result.recordset[0];
};

const removeFriend = async (requestId, userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('requestId', sql.Int, requestId)
    .input('userId', sql.Int, userId)
    .query(`
      DELETE FROM Friends
      OUTPUT DELETED.*
      WHERE id = @requestId
        AND (senderId = @userId OR receiverId = @userId)
    `);

  return result.recordset[0];
};

module.exports = {
  searchUsers,
  getMyFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
};
