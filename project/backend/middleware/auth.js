const crypto = require('crypto');

/**
 * Validates Telegram WebApp initData
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function validateTelegramWebAppData(initData, botToken) {
  try {
    // Parse the init data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Create data-check-string
    const dataCheckArr = [];
    for (const [key, value] of urlParams.entries()) {
      dataCheckArr.push(`${key}=${value}`);
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Calculate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return false;
  }
}

/**
 * Middleware to authenticate Telegram users
 */
const authenticateTelegram = async (req, res, next) => {
  try {
    const initData = req.body.initData || req.headers['x-telegram-init-data'];

    if (!initData) {
      return res.status(401).json({
        success: false,
        error: 'Missing Telegram authentication data'
      });
    }

    // Validate the init data
    const isValid = validateTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Telegram authentication data'
      });
    }

    // Parse user data
    const urlParams = new URLSearchParams(initData);
    const userDataStr = urlParams.get('user');

    if (!userDataStr) {
      return res.status(401).json({
        success: false,
        error: 'Missing user data'
      });
    }

    const userData = JSON.parse(decodeURIComponent(userDataStr));

    // Attach user data to request
    req.telegramUser = {
      id: userData.id.toString(),
      username: userData.username || null,
      firstName: userData.first_name || null,
      lastName: userData.last_name || null
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no auth data
 */
const optionalAuth = async (req, res, next) => {
  try {
    const initData = req.body.initData || req.headers['x-telegram-init-data'];

    if (initData) {
      const isValid = validateTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN);

      if (isValid) {
        const urlParams = new URLSearchParams(initData);
        const userDataStr = urlParams.get('user');

        if (userDataStr) {
          const userData = JSON.parse(decodeURIComponent(userDataStr));
          req.telegramUser = {
            id: userData.id.toString(),
            username: userData.username || null,
            firstName: userData.first_name || null,
            lastName: userData.last_name || null
          };
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = {
  authenticateTelegram,
  optionalAuth,
  validateTelegramWebAppData
};
