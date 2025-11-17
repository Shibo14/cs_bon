require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const axios = require('axios');
const Skin = require('../backend/models/Skin');

/**
 * Fetch skins from Steam Market API
 */
async function fetchFromSteamMarket() {
  const apiKey = process.env.STEAM_API_KEY || process.env.STEAM_MARKET_API_KEY;

  if (!apiKey) {
    console.log('⚠️  No Steam API key found, using mock data');
    return getMockSkins();
  }

  try {
    // Steam Market API has limited public endpoints
    // This is a basic example - in production, use a proper skin API service
    const response = await axios.get(
      `https://api.steampowered.com/ISteamEconomy/GetAssetPrices/v1/`,
      {
        params: {
          key: apiKey,
          appid: 730, // CS:GO
          currency: 1 // USD
        }
      }
    );

    // Process and return skins
    return processSteamData(response.data);
  } catch (error) {
    console.error('Error fetching from Steam:', error.message);
    return getMockSkins();
  }
}

/**
 * Fetch skins from Skinport API
 */
async function fetchFromSkinport() {
  const clientId = process.env.SKINPORT_CLIENT_ID;
  const clientSecret = process.env.SKINPORT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log('⚠️  No Skinport credentials found, using mock data');
    return getMockSkins();
  }

  try {
    const response = await axios.get('https://api.skinport.com/v1/items', {
      params: {
        app_id: 730,
        currency: 'USD'
      }
    });

    return processSkinportData(response.data);
  } catch (error) {
    console.error('Error fetching from Skinport:', error.message);
    return getMockSkins();
  }
}

/**
 * Process Steam API data
 */
function processSteamData(data) {
  // Transform Steam API data to our format
  // This is a simplified example
  return getMockSkins();
}

/**
 * Process Skinport API data
 */
function processSkinportData(data) {
  if (!data || !Array.isArray(data)) {
    return getMockSkins();
  }

  return data.slice(0, 50).map(item => ({
    name: item.market_name,
    marketHashName: item.market_hash_name,
    price: item.min_price / 100, // Convert cents to dollars
    imageUrl: item.image,
    rarity: mapRarity(item.category),
    rarityColor: Skin.getRarityColor(mapRarity(item.category)),
    category: mapCategory(item.type),
    exterior: item.exterior || 'Field-Tested',
    float: 0.5,
    active: true
  }));
}

/**
 * Map API rarity to our rarity
 */
function mapRarity(category) {
  const rarityMap = {
    'consumer': 'Consumer Grade',
    'industrial': 'Industrial Grade',
    'milspec': 'Mil-Spec',
    'restricted': 'Restricted',
    'classified': 'Classified',
    'covert': 'Covert',
    'knife': 'Exceedingly Rare',
    'gloves': 'Exceedingly Rare'
  };

  return rarityMap[category?.toLowerCase()] || 'Consumer Grade';
}

/**
 * Map API category to our category
 */
function mapCategory(type) {
  const categoryMap = {
    'knife': 'Knife',
    'rifle': 'Rifle',
    'pistol': 'Pistol',
    'smg': 'SMG',
    'sniper': 'Sniper',
    'shotgun': 'Shotgun',
    'machinegun': 'Machine Gun',
    'gloves': 'Gloves'
  };

  return categoryMap[type?.toLowerCase()] || 'Rifle';
}

/**
 * Get mock skins for testing
 */
function getMockSkins() {
  return [
    {
      name: 'AK-47 | Redline',
      marketHashName: 'AK-47 | Redline (Field-Tested)',
      price: 25.50,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsZGHyd4_Bd1RvNQ7T_FLrw-_ng5Pu75iY1zI97bhCR2jT/330x192',
      rarity: 'Classified',
      rarityColor: '#d32ce6',
      category: 'Rifle',
      exterior: 'Field-Tested',
      float: 0.25,
      active: true
    },
    {
      name: 'AWP | Dragon Lore',
      marketHashName: 'AWP | Dragon Lore (Factory New)',
      price: 8500.00,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2D4D68F03r2Qpd2tigHkrRE_YTz1JdKVcVA5NQqB_lG4yey8m9bi62GwE1HO/330x192',
      rarity: 'Covert',
      rarityColor: '#eb4b4b',
      category: 'Sniper',
      exterior: 'Factory New',
      float: 0.01,
      active: true
    },
    {
      name: 'M4A4 | Howl',
      marketHashName: 'M4A4 | Howl (Field-Tested)',
      price: 3500.00,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDL_ummJW4NFOhujT8om7jVC9vywwMiukcZjBJwBvMlDV_le7wO7p1pW6uZ_A1zI97ZgbDo99/330x192',
      rarity: 'Covert',
      rarityColor: '#eb4b4b',
      category: 'Rifle',
      exterior: 'Field-Tested',
      float: 0.18,
      active: true
    },
    {
      name: 'Glock-18 | Fade',
      marketHashName: 'Glock-18 | Fade (Factory New)',
      price: 450.00,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79fnzL-YnvvsJ6jummJW4NE_2LiZ8N2t2wW3-Ec-ZDv3JoaTdlQ7Y1qF-1fox-jxxcjr0EuJZA/330x192',
      rarity: 'Restricted',
      rarityColor: '#8847ff',
      category: 'Pistol',
      exterior: 'Factory New',
      float: 0.03,
      active: true
    },
    {
      name: 'Desert Eagle | Blaze',
      marketHashName: 'Desert Eagle | Blaze (Factory New)',
      price: 750.00,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH_9mkgIWKkPvLPr7Vn35cpp0njL6Yo92tigew-0NkNj-iJY6XcgE2ZlnX-Fm2yersm9bi6-x9bW7K/330x192',
      rarity: 'Restricted',
      rarityColor: '#8847ff',
      category: 'Pistol',
      exterior: 'Factory New',
      float: 0.01,
      active: true
    },
    {
      name: 'USP-S | Kill Confirmed',
      marketHashName: 'USP-S | Kill Confirmed (Field-Tested)',
      price: 55.00,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j5Nr_Yg2Yf65Ry3uuQoI2h0VXi_EBpZWGnJI_HdFQ_ZVHX-ADqkrvo1sW8uMzOn3Zjuj5iuygaZnVo1g/330x192',
      rarity: 'Classified',
      rarityColor: '#d32ce6',
      category: 'Pistol',
      exterior: 'Field-Tested',
      float: 0.22,
      active: true
    },
    {
      name: 'MAC-10 | Neon Rider',
      marketHashName: 'MAC-10 | Neon Rider (Factory New)',
      price: 12.50,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYyJl4WZlP_9Jr7um25V4dB8teXI8oThxgbl-UZpMmihd4-RdFA3YAnYqwW6w-bvgZPu6IOJlyU3aHLHLA/330x192',
      rarity: 'Classified',
      rarityColor: '#d32ce6',
      category: 'SMG',
      exterior: 'Factory New',
      float: 0.02,
      active: true
    },
    {
      name: 'P90 | Asiimov',
      marketHashName: 'P90 | Asiimov (Field-Tested)',
      price: 8.75,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopuP1FA957ODDS8DdmrKGkK-HnvD8J_WCxj0I6pQn3L_D9Imn2Vbn_UJuMT2gJI-QdlU-aAzT_gTqlebpjZG76pXLnHNn6D5iuyj3RVZJhg/330x192',
      rarity: 'Classified',
      rarityColor: '#d32ce6',
      category: 'SMG',
      exterior: 'Field-Tested',
      float: 0.28,
      active: true
    },
    {
      name: 'Karambit | Fade',
      marketHashName: 'Karambit | Fade (Factory New)',
      price: 2500.00,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRd4cJ5nqeYpdWm0QW1rhJoYmimIteUdlA_YguDqAC8kOm915a-7ZXNyyM1pGB8sss4MRJR/330x192',
      rarity: 'Exceedingly Rare',
      rarityColor: '#ffd700',
      category: 'Knife',
      exterior: 'Factory New',
      float: 0.01,
      active: true
    },
    {
      name: 'M4A1-S | Hyper Beast',
      marketHashName: 'M4A1-S | Hyper Beast (Field-Tested)',
      price: 18.00,
      imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO3mb-GkuP1P6jummJW4NE_2r-RpNj22ADl-kVvajyldo6UdFU5ZFzXqFO-xLvxxcjrwCHr-nM/330x192',
      rarity: 'Covert',
      rarityColor: '#eb4b4b',
      category: 'Rifle',
      exterior: 'Field-Tested',
      float: 0.27,
      active: true
    }
  ];
}

/**
 * Save skins to database
 */
async function saveSkins(skins) {
  let savedCount = 0;
  let updatedCount = 0;

  for (const skinData of skins) {
    try {
      const existingSkin = await Skin.findOne({ marketHashName: skinData.marketHashName });

      if (existingSkin) {
        // Update existing skin
        Object.assign(existingSkin, skinData);
        await existingSkin.save();
        updatedCount++;
      } else {
        // Create new skin
        await Skin.create(skinData);
        savedCount++;
      }
    } catch (error) {
      console.error(`Error saving skin ${skinData.name}:`, error.message);
    }
  }

  return { savedCount, updatedCount };
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting skin data fetch...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Try different data sources
    let skins = [];

    // Try Skinport first
    if (process.env.SKINPORT_CLIENT_ID) {
      console.log('📡 Fetching from Skinport...');
      skins = await fetchFromSkinport();
    }

    // Fallback to Steam Market
    if (skins.length === 0 && process.env.STEAM_API_KEY) {
      console.log('📡 Fetching from Steam Market...');
      skins = await fetchFromSteamMarket();
    }

    // Use mock data if no API available
    if (skins.length === 0) {
      console.log('📦 Using mock data...');
      skins = getMockSkins();
    }

    console.log(`📊 Found ${skins.length} skins`);

    // Save to database
    const { savedCount, updatedCount } = await saveSkins(skins);

    console.log(`✅ Saved ${savedCount} new skins`);
    console.log(`✅ Updated ${updatedCount} existing skins`);

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('✨ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fetchFromSteamMarket,
  fetchFromSkinport,
  getMockSkins,
  saveSkins
};
