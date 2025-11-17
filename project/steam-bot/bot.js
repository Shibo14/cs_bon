require('dotenv').config({ path: '../.env' });
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamTotp = require('steam-totp');
const mongoose = require('mongoose');
const config = require('./config/config');
const logger = require('./helpers/logger');
const steamHelper = require('./helpers/steamHelper');

// Import models
const WithdrawRequest = require('../backend/models/WithdrawRequest');
const Inventory = require('../backend/models/Inventory');
const Skin = require('../backend/models/Skin');

// Initialize Steam clients
const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
  steam: client,
  community: community,
  language: 'en'
});

// Bot state
let isLoggedIn = false;
let processingQueue = false;

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  try {
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.success('Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

/**
 * Login to Steam
 */
function loginToSteam() {
  logger.info('Logging into Steam...');

  const loginDetails = {
    accountName: config.steam.username,
    password: config.steam.password
  };

  // Add 2FA code if shared secret is available
  if (config.steam.sharedSecret) {
    loginDetails.twoFactorCode = SteamTotp.generateAuthCode(config.steam.sharedSecret);
  }

  client.logOn(loginDetails);
}

/**
 * Handle successful login
 */
client.on('loggedOn', () => {
  logger.success(`Logged into Steam as ${client.steamID.getSteamID64()}`);
  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed([730]); // CS:GO app ID
  isLoggedIn = true;
});

/**
 * Handle web session
 */
client.on('webSession', (sessionID, cookies) => {
  logger.info('Got web session');

  manager.setCookies(cookies, (err) => {
    if (err) {
      logger.error('Failed to set cookies', err);
      return;
    }

    logger.success('Trade Manager cookies set');

    // Set API key
    if (config.steam.apiKey) {
      community.startConfirmationChecker(10000, config.steam.identitySecret);
      logger.info('Auto-confirmation enabled');
    }
  });

  community.setCookies(cookies);
});

/**
 * Handle Steam errors
 */
client.on('error', (err) => {
  logger.error('Steam client error', err);
  isLoggedIn = false;

  // Retry login after delay
  setTimeout(() => {
    logger.info('Retrying login...');
    loginToSteam();
  }, 30000);
});

/**
 * Handle disconnection
 */
client.on('disconnected', (eresult, msg) => {
  logger.warn(`Disconnected from Steam: ${msg}`);
  isLoggedIn = false;
});

/**
 * Handle new trade offers
 */
manager.on('newOffer', (offer) => {
  logger.info(`New trade offer #${offer.id} from ${offer.partner.getSteamID64()}`);

  // Automatically decline incoming offers (bot only sends)
  offer.decline((err) => {
    if (err) {
      logger.error(`Failed to decline offer #${offer.id}`, err);
    } else {
      logger.info(`Declined incoming offer #${offer.id}`);
    }
  });
});

/**
 * Handle trade offer state changes
 */
manager.on('sentOfferChanged', async (offer, oldState) => {
  logger.info(
    `Offer #${offer.id} changed: ${steamHelper.getTradeOfferStateName(oldState)} -> ${steamHelper.getTradeOfferStateName(offer.state)}`
  );

  try {
    // Find the withdraw request
    const withdrawRequest = await WithdrawRequest.findOne({ tradeOfferId: offer.id.toString() });

    if (!withdrawRequest) {
      logger.warn(`No withdraw request found for offer #${offer.id}`);
      return;
    }

    // Update based on new state
    if (offer.state === TradeOfferManager.ETradeOfferState.Accepted) {
      // Trade accepted
      await withdrawRequest.markAccepted();

      // Mark inventory item as withdrawn
      const inventoryItem = await Inventory.findById(withdrawRequest.inventoryItemId);
      if (inventoryItem) {
        await inventoryItem.markWithdrawn();
      }

      logger.success(`Withdraw request ${withdrawRequest._id} completed successfully`);
    } else if (offer.state === TradeOfferManager.ETradeOfferState.Declined) {
      // Trade declined
      await withdrawRequest.markDeclined();

      // Mark inventory item as available again
      const inventoryItem = await Inventory.findById(withdrawRequest.inventoryItemId);
      if (inventoryItem) {
        inventoryItem.status = 'available';
        await inventoryItem.save();
      }

      logger.warn(`Withdraw request ${withdrawRequest._id} was declined`);
    } else if ([TradeOfferManager.ETradeOfferState.Expired, TradeOfferManager.ETradeOfferState.Canceled, TradeOfferManager.ETradeOfferState.InvalidItems].includes(offer.state)) {
      // Trade failed
      await withdrawRequest.markFailed(steamHelper.getTradeOfferStateName(offer.state));

      // Mark inventory item as available again
      const inventoryItem = await Inventory.findById(withdrawRequest.inventoryItemId);
      if (inventoryItem) {
        inventoryItem.status = 'available';
        await inventoryItem.save();
      }

      logger.error(`Withdraw request ${withdrawRequest._id} failed: ${steamHelper.getTradeOfferStateName(offer.state)}`);
    }
  } catch (error) {
    logger.error('Error handling trade offer state change', error);
  }
});

/**
 * Send trade offer
 */
async function sendTradeOffer(withdrawRequest) {
  try {
    logger.info(`Processing withdraw request ${withdrawRequest._id}`);

    // Parse trade URL
    const { partner, token } = steamHelper.parseTradeUrl(withdrawRequest.steamTradeUrl);

    // Get bot inventory
    const botInventory = await getInventory(client.steamID.getSteamID64());

    if (!botInventory || botInventory.length === 0) {
      throw new Error('Bot inventory is empty');
    }

    // For demo purposes, we'll send the first available item
    // In production, you would match the specific skin from the database
    const skinToSend = botInventory[0];

    // Create trade offer
    const offer = manager.createOffer(steamHelper.partnerToSteamID64(partner));
    offer.setToken(token);
    offer.addMyItem(skinToSend);
    offer.setMessage(`Withdrawal: ${withdrawRequest.skinId.name}`);

    // Send offer
    return new Promise((resolve, reject) => {
      offer.send((err, status) => {
        if (err) {
          reject(err);
          return;
        }

        logger.success(`Trade offer sent: #${offer.id}`);
        logger.info(`Status: ${status}`);

        resolve({
          offerId: offer.id,
          status: status,
          tradeHoldDuration: offer.escrowEnds ? Math.floor((offer.escrowEnds - Date.now()) / 1000 / 86400) : 0
        });
      });
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get Steam inventory
 */
function getInventory(steamID) {
  return new Promise((resolve, reject) => {
    manager.getUserInventoryContents(steamID, 730, 2, true, (err, inventory) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(inventory);
    });
  });
}

/**
 * Process withdraw queue
 */
async function processWithdrawQueue() {
  if (processingQueue || !isLoggedIn) {
    return;
  }

  processingQueue = true;

  try {
    // Get pending withdraw requests
    const pendingRequests = await WithdrawRequest.find({ status: 'pending' })
      .populate('userId')
      .populate('skinId')
      .sort({ requestedAt: 1 })
      .limit(5); // Process max 5 at a time

    if (pendingRequests.length === 0) {
      processingQueue = false;
      return;
    }

    logger.info(`Processing ${pendingRequests.length} pending withdraw requests`);

    for (const request of pendingRequests) {
      try {
        // Mark as processing
        await request.markProcessing();

        // Send trade offer
        const result = await sendTradeOffer(request);

        // Update request with trade offer ID
        await request.markSent(result.offerId.toString(), result.tradeHoldDuration);

        logger.success(`Withdraw request ${request._id} sent as offer #${result.offerId}`);

        // Wait a bit between offers to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error(`Failed to process withdraw request ${request._id}`, error);

        // Check if can retry
        if (request.canRetry()) {
          request.status = 'pending';
          await request.save();
        } else {
          await request.markFailed(error.message);

          // Mark inventory item as available again
          const inventoryItem = await Inventory.findById(request.inventoryItemId);
          if (inventoryItem) {
            inventoryItem.status = 'available';
            await inventoryItem.save();
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error processing withdraw queue', error);
  }

  processingQueue = false;
}

/**
 * Check sent offers for updates
 */
async function checkSentOffers() {
  try {
    const sentRequests = await WithdrawRequest.find({ status: 'sent' })
      .sort({ processedAt: 1 });

    for (const request of sentRequests) {
      if (!request.tradeOfferId) continue;

      manager.getOffer(request.tradeOfferId, async (err, offer) => {
        if (err) {
          logger.error(`Failed to get offer #${request.tradeOfferId}`, err);
          return;
        }

        // Update will be handled by sentOfferChanged event
        request.tradeOfferState = offer.state;
        await request.save();
      });
    }
  } catch (error) {
    logger.error('Error checking sent offers', error);
  }
}

/**
 * Start the bot
 */
async function start() {
  logger.info('Starting Steam Trade Bot...');

  // Connect to database
  await connectDatabase();

  // Login to Steam
  loginToSteam();

  // Start polling for withdraw requests
  setInterval(() => {
    if (isLoggedIn) {
      processWithdrawQueue();
    }
  }, config.bot.pollInterval);

  // Check sent offers periodically
  setInterval(() => {
    if (isLoggedIn) {
      checkSentOffers();
    }
  }, 60000); // Every minute

  logger.success('Steam Trade Bot started successfully');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down bot...');
  client.logOff();
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down bot...');
  client.logOff();
  mongoose.connection.close();
  process.exit(0);
});

// Start the bot
start();

module.exports = {
  client,
  manager,
  community
};
