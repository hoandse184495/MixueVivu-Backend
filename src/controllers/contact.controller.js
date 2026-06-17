const contactService = require('../services/contact.service');

const createContact = async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        message: 'Subject and message are required',
      });
    }

    const contact = await contactService.createContact({
      userId: req.user.id,
      subject,
      message,
    });

    res.status(201).json({
      message: 'Send contact successfully',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

const getMyContacts = async (req, res, next) => {
  try {
    const contacts = await contactService.getMyContacts(req.user.id);

    res.status(200).json({
      message: 'Get my contacts successfully',
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await contactService.getAllContacts();

    res.status(200).json({
      message: 'Get all contacts successfully',
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

const replyContact = async (req, res, next) => {
  try {
    const contact = await contactService.replyContact({
      id: req.params.id,
      reply: req.body.reply,
      status: req.body.status,
    });

    if (!contact) {
      return res.status(404).json({
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      message: 'Reply contact successfully',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContact,
  getMyContacts,
  getAllContacts,
  replyContact,
};