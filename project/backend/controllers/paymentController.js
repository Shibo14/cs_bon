const userService = require('../services/userService');

/**
 * Mock payment via UzCard
 */
exports.payWithUzCard = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { amount, cardNumber } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Mock payment processing
    // In production, integrate with actual UzCard payment gateway
    console.log(`Mock UzCard payment: ${amount} crystals for user ${user.telegramId}`);

    // For now, just return a mock response
    res.json({
      success: true,
      message: 'Payment processing initiated',
      data: {
        paymentId: `uzcard_${Date.now()}`,
        amount: amount,
        status: 'pending',
        redirectUrl: 'https://mock-uzcard-payment.com/pay'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mock payment via Click
 */
exports.payWithClick = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Mock payment processing
    console.log(`Mock Click payment: ${amount} crystals for user ${user.telegramId}`);

    res.json({
      success: true,
      message: 'Payment processing initiated',
      data: {
        paymentId: `click_${Date.now()}`,
        amount: amount,
        status: 'pending',
        redirectUrl: 'https://mock-click-payment.com/pay'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Payment via Telegram Stars
 */
exports.payWithStars = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Mock Telegram Stars payment
    console.log(`Mock Telegram Stars payment: ${amount} crystals for user ${user.telegramId}`);

    res.json({
      success: true,
      message: 'Payment processing initiated',
      data: {
        paymentId: `stars_${Date.now()}`,
        amount: amount,
        status: 'pending',
        invoiceUrl: 'https://t.me/invoice/mock'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mock payment callback/webhook
 * This would be called by the payment provider to confirm payment
 */
exports.paymentCallback = async (req, res, next) => {
  try {
    const { paymentId, status, userId, amount } = req.body;

    // Verify payment signature (implement based on payment provider)
    // For mock purposes, we'll just accept it

    if (status === 'success') {
      const user = await userService.getUserByTelegramId(userId);
      if (user) {
        await userService.addCrystals(user._id, amount);
        console.log(`✅ Payment confirmed: ${amount} crystals added to user ${userId}`);
      }
    }

    res.json({
      success: true,
      message: 'Payment callback processed'
    });
  } catch (error) {
    next(error);
  }
};
