const paymentService = require('../services/payment.service');

const getAllPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json({ message: 'Get all payments successfully', data: payments });
  } catch (error) {
    next(error);
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getMyPayments(req.user.id);
    res.status(200).json({ message: 'Get my payments successfully', data: payments });
  } catch (error) {
    next(error);
  }
};

const submitPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.submitPayment(
      Number(req.params.id),
      req.user.id,
      {
        transactionId: req.body.transactionId,
        note: req.body.note,
      }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Pending payment not found' });
    }

    res.status(200).json({ message: 'Payment submitted successfully', data: payment });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.confirmPayment(Number(req.params.id));
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment confirmed successfully', data: payment });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Payment not found' });
    next(error);
  }
};

const refundPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.refundPayment(Number(req.params.id), req.body.note);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment refunded successfully', data: payment });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Payment not found' });
    next(error);
  }
};

module.exports = { getAllPayments, getMyPayments, submitPayment, confirmPayment, refundPayment };
