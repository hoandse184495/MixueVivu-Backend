const { prisma } = require('../config/db');

const createContact = async ({ userId, subject, message }) => {
  return await prisma.contacts.create({
    data: {
      userId,
      subject,
      message,
      status: 'pending',
    },
  });
};

const getMyContacts = async (userId) => {
  return await prisma.contacts.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

const getAllContacts = async () => {
  const contacts = await prisma.contacts.findMany({
    include: { Users: true },
    orderBy: { createdAt: 'desc' },
  });

  return contacts.map((c) => ({
    ...c,
    userName: c.Users?.fullName,
    userEmail: c.Users?.email,
    userPhone: c.Users?.phone,
  }));
};

const replyContact = async ({ id, reply, status }) => {
  return await prisma.contacts.update({
    where: { id },
    data: {
      reply: reply || '',
      status: status || 'replied',
    },
  });
};

module.exports = {
  createContact,
  getMyContacts,
  getAllContacts,
  replyContact,
};