require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Case = require('../backend/models/Case');
const Skin = require('../backend/models/Skin');
const { getMockSkins, saveSkins } = require('./fetch_skins');

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - be careful in production!)
    // await Case.deleteMany({});
    // await Skin.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Add skins
    console.log('📦 Adding skins...');
    const skins = getMockSkins();
    await saveSkins(skins);

    // Get all skins from database
    const allSkins = await Skin.find({ active: true });

    if (allSkins.length === 0) {
      console.error('❌ No skins found in database');
      return;
    }

    // Create cases
    console.log('📦 Creating cases...');

    // Case 1: Budget Case
    const budgetCase = await Case.findOne({ name: 'Budget Case' });
    if (!budgetCase) {
      await Case.create({
        name: 'Budget Case',
        description: 'Great items at a great price!',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DAQ1h3LAVbv6mxFABs3OXNYgJR_Nm1nYGHnuTgDKjYl3lu5cB1g_zMy4D0mlGx5UJpZzrxJoXHJgQ8Y13Q_QXqw-7xxcjrP4mBc8k/330fx247f',
        price: 10,
        active: true,
        contents: [
          { skinId: allSkins[6]._id, probability: 40 }, // MAC-10 Neon Rider
          { skinId: allSkins[7]._id, probability: 30 }, // P90 Asiimov
          { skinId: allSkins[3]._id, probability: 20 }, // Glock Fade
          { skinId: allSkins[5]._id, probability: 9 },  // USP-S Kill Confirmed
          { skinId: allSkins[0]._id, probability: 1 }   // AK-47 Redline
        ]
      });
      console.log('✅ Created Budget Case');
    }

    // Case 2: Premium Case
    const premiumCase = await Case.findOne({ name: 'Premium Case' });
    if (!premiumCase) {
      await Case.create({
        name: 'Premium Case',
        description: 'High-tier skins with great odds!',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DAR0h3LAVbv6mxFABs3OXNYgJR_Nmzm4-0mvLwOq7c2GkBv8Fy0-iS8I7w2VLk-UE5a2vxLdeWcFQ-aVGCrgTtyunngpHutJ_BnXBnu3FztirfykS00BdIaeckxA/330fx247f',
        price: 50,
        active: true,
        contents: [
          { skinId: allSkins[9]._id, probability: 35 }, // M4A1-S Hyper Beast
          { skinId: allSkins[0]._id, probability: 30 }, // AK-47 Redline
          { skinId: allSkins[5]._id, probability: 20 }, // USP-S Kill Confirmed
          { skinId: allSkins[4]._id, probability: 10 }, // Desert Eagle Blaze
          { skinId: allSkins[3]._id, probability: 4 },  // Glock Fade
          { skinId: allSkins[2]._id, probability: 1 }   // M4A4 Howl
        ]
      });
      console.log('✅ Created Premium Case');
    }

    // Case 3: Legendary Case
    const legendaryCase = await Case.findOne({ name: 'Legendary Case' });
    if (!legendaryCase) {
      await Case.create({
        name: 'Legendary Case',
        description: 'The ultimate case with legendary items!',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DAQ1JkKAVbv6mxFABs3OXNYgJP_t2ym4mOqPr1I7rdlmJe18h0teXI8oTht1i1uRQ5fT_yJYeUJlc_MgvZ-1Xrxubvg4j84srD7jgYNA/330fx247f',
        price: 100,
        active: true,
        contents: [
          { skinId: allSkins[4]._id, probability: 30 }, // Desert Eagle Blaze
          { skinId: allSkins[3]._id, probability: 25 }, // Glock Fade
          { skinId: allSkins[2]._id, probability: 20 }, // M4A4 Howl
          { skinId: allSkins[8]._id, probability: 15 }, // Karambit Fade
          { skinId: allSkins[1]._id, probability: 10 }  // AWP Dragon Lore
        ]
      });
      console.log('✅ Created Legendary Case');
    }

    console.log('✅ Database seeded successfully!');

    // Show stats
    const totalSkins = await Skin.countDocuments();
    const totalCases = await Case.countDocuments();

    console.log(`\n📊 Database Statistics:`);
    console.log(`   Skins: ${totalSkins}`);
    console.log(`   Cases: ${totalCases}`);

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
  seedDatabase();
}

module.exports = seedDatabase;
