require('dotenv').config({ path: '../../.env' });

module.exports = {
  // Steam credentials
  steam: {
    username: process.env.STEAM_USERNAME,
    password: process.env.STEAM_PASSWORD,
    sharedSecret: process.env.STEAM_SHARED_SECRET,
    identitySecret: process.env.STEAM_IDENTITY_SECRET,
    apiKey: process.env.STEAM_API_KEY
  },

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI
  },

  // Bot configuration
  bot: {
    pollInterval: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 5000 // 5 seconds
  }
};
