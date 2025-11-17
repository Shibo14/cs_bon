# Telegram CS:GO Case Opener Mini App

A full-featured Telegram Mini App for opening CS:GO cases and trading skins with real Steam integration.

## 🎯 Features

- **Telegram Mini App** - Modern, mobile-first web interface
- **Case Opening System** - Multiple cases with different rarities and probabilities
- **User Balance** - Crystal-based virtual currency system
- **Inventory Management** - Store and manage won items
- **Steam Trading Bot** - Real working Steam bot for item withdrawals
- **Payment Integration** - Mock payment endpoints for UzCard, Click, and Telegram Stars
- **Real-time Updates** - Live trade offer status tracking

## 📁 Project Structure

```
project/
├── backend/                  # Backend API (Express + MongoDB)
│   ├── app.js               # Main application entry point
│   ├── routes/              # API route definitions
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── middleware/          # Authentication & error handling
│   └── config/              # Database configuration
├── steam-bot/               # Steam Trade Bot
│   ├── bot.js               # Main bot logic
│   ├── helpers/             # Helper utilities
│   └── config/              # Bot configuration
├── miniapp/                 # Telegram Mini App (Frontend)
│   ├── index.html           # Main HTML file
│   ├── scripts/             # JavaScript files
│   └── styles/              # CSS files
├── scripts/                 # Utility scripts
│   ├── fetch_skins.js       # Fetch skins from external APIs
│   └── seed_database.js     # Seed initial database data
├── package.json             # Project dependencies
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Steam account with API key
- Telegram Bot Token

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/telegram_case_opener

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Steam Bot Configuration
STEAM_USERNAME=your_steam_username
STEAM_PASSWORD=your_steam_password
STEAM_SHARED_SECRET=your_steam_shared_secret
STEAM_IDENTITY_SECRET=your_steam_identity_secret
STEAM_API_KEY=your_steam_api_key

# Application Configuration
DEFAULT_CRYSTALS=100
CASE_OPENING_COST=10
```

### 4. Set Up Database

```bash
# Start MongoDB (if not running)
mongod

# Seed the database with initial data
node scripts/seed_database.js
```

## 🎮 Running the Application

### Run Backend Server

```bash
npm run backend
```

The API server will start on `http://localhost:3000`

### Run Steam Trade Bot

```bash
npm run bot
```

The Steam bot will login and start processing withdraw requests.

### Run Both (Development)

```bash
npm run dev
```

This runs both the backend and Steam bot concurrently.

## 📱 Setting Up Telegram Mini App

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the instructions
3. Save your bot token

### 2. Set Up Web App

1. Send `/newapp` to BotFather
2. Select your bot
3. Provide app details (name, description, photo)
4. For the Web App URL, use your deployed frontend URL or for local testing: `https://your-ngrok-url.ngrok.io/miniapp/index.html`

### 3. Configure Web App URL in Frontend

Edit `miniapp/scripts/app.js` and update the API base URL:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

### 4. Test Your Mini App

1. Open your bot in Telegram
2. Send `/start` or click the menu button
3. Click on your Web App to open it

## 🔧 Steam Bot Setup

### Getting Steam Credentials

#### 1. Steam API Key

1. Go to https://steamcommunity.com/dev/apikey
2. Register for a Steam Web API key
3. Save the API key to your `.env` file

#### 2. Steam Guard (2FA) Secrets

You need to extract your Steam Guard secrets:

**Using Steam Desktop Authenticator:**

1. Download [Steam Desktop Authenticator](https://github.com/Jessecar96/SteamDesktopAuthenticator)
2. Set up your account
3. Find `shared_secret` and `identity_secret` in the `.maFile`
4. Add them to your `.env` file

**Security Note:** Keep these secrets secure and never share them!

#### 3. Bot Inventory

For the bot to send items:

1. Add CS:GO items to your bot's Steam inventory
2. Ensure Steam Guard Mobile Authenticator is active
3. Trade holds should be removed (15-day trade URL setup)

### Testing the Bot

```bash
node steam-bot/bot.js
```

Watch the console for:
- ✅ Login successful
- ✅ Trade Manager cookies set
- ✅ Auto-confirmation enabled

## 💳 Payment Integration

Currently, payment endpoints are mocked. To integrate real payments:

### UzCard Integration

1. Sign up for UzCard merchant account
2. Get API credentials
3. Implement webhook handler in `backend/controllers/paymentController.js`

### Click Integration

1. Register at Click merchant portal
2. Get merchant credentials
3. Implement payment callback handler

### Telegram Stars

1. Use Telegram Payments API
2. Set up invoice creation with `createInvoiceLink`
3. Handle `pre_checkout_query` and `successful_payment` updates

## 🌐 Deployment

### Deploy Backend (Railway/Render)

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set MONGODB_URI=<your-mongodb-uri>
railway variables set TELEGRAM_BOT_TOKEN=<your-token>
# ... add all other variables

# Deploy
railway up
```

#### Render

1. Create new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm run backend`
5. Add environment variables in dashboard

### Deploy Steam Bot (Separate Service)

The Steam bot should run as a separate background service:

```bash
# On Railway or Render, create a second service
# Set start command: npm run bot
```

### Deploy Frontend

The frontend is static HTML/JS and can be deployed to:

- **Netlify**: Drag and drop the `miniapp` folder
- **Vercel**: Connect repository and set root directory to `miniapp`
- **GitHub Pages**: Push `miniapp` folder to gh-pages branch

### Update Mini App URL

After deployment:

1. Update `API_BASE_URL` in `miniapp/scripts/app.js`
2. Redeploy frontend
3. Update Web App URL in BotFather

## 🗄️ Database Schemas

### User
- `telegramId`: Unique Telegram user ID
- `crystals`: User's crystal balance
- `steamTradeUrl`: Steam trade URL for withdrawals

### Skin
- `name`: Skin display name
- `marketHashName`: Unique Steam market identifier
- `price`: Skin price in USD
- `imageUrl`: Skin image URL
- `rarity`: Skin rarity level
- `category`: Weapon category

### Case
- `name`: Case name
- `price`: Cost in crystals
- `contents`: Array of skins with probabilities
- `active`: Whether case is available

### Inventory
- `userId`: Reference to user
- `skinId`: Reference to skin
- `status`: `available`, `pending_withdrawal`, `withdrawn`

### WithdrawRequest
- `userId`: Reference to user
- `skinId`: Reference to skin
- `steamTradeUrl`: User's trade URL
- `status`: `pending`, `processing`, `sent`, `accepted`, `failed`
- `tradeOfferId`: Steam trade offer ID

## 🔒 Security Considerations

1. **Telegram WebApp Data Validation**: The backend validates all requests using Telegram's signature verification
2. **Steam Credentials**: Store Steam credentials securely and never commit to version control
3. **Database**: Use MongoDB authentication in production
4. **HTTPS**: Always use HTTPS for production deployment
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Input Validation**: All user inputs are validated server-side

## 📊 API Endpoints

### User Routes
- `GET /api/users/me` - Get current user
- `POST /api/users/steam-trade-url` - Update Steam trade URL
- `GET /api/users/stats` - Get user statistics

### Case Routes
- `GET /api/cases` - Get all cases
- `GET /api/cases/:caseId` - Get case details
- `POST /api/cases/open` - Open a case

### Inventory Routes
- `GET /api/inventory` - Get user inventory
- `GET /api/inventory/available` - Get available items
- `GET /api/inventory/stats` - Get inventory statistics

### Withdraw Routes
- `POST /api/withdraw` - Create withdraw request
- `GET /api/withdraw` - Get user's withdrawals
- `POST /api/withdraw/:requestId/cancel` - Cancel withdrawal

### Payment Routes
- `POST /api/payment/uzcard` - Pay with UzCard
- `POST /api/payment/click` - Pay with Click
- `POST /api/payment/stars` - Pay with Telegram Stars

## 🐛 Troubleshooting

### Steam Bot Not Logging In

- Verify username and password
- Check if 2FA codes are being generated correctly
- Ensure `shared_secret` is correct
- Try disabling Steam Guard temporarily (not recommended for production)

### MongoDB Connection Failed

- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Ensure MongoDB port (27017) is not blocked

### Telegram WebApp Not Loading

- Check CORS settings in backend
- Verify `API_BASE_URL` is correct
- Test API endpoints directly with Postman
- Check browser console for errors

### Trade Offers Not Sending

- Verify bot has items in inventory
- Check Steam API key is valid
- Ensure trade URL format is correct
- Check bot's trade permissions

## 📝 Development

### Add New Case

```javascript
await Case.create({
  name: 'New Case',
  description: 'Description here',
  imageUrl: 'https://...',
  price: 25,
  active: true,
  contents: [
    { skinId: skin1._id, probability: 50 },
    { skinId: skin2._id, probability: 30 },
    { skinId: skin3._id, probability: 20 }
  ]
});
```

### Fetch Real Skins

```bash
# Configure API keys in .env
SKINPORT_CLIENT_ID=your_client_id
SKINPORT_CLIENT_SECRET=your_client_secret

# Run fetcher
node scripts/fetch_skins.js
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## 🎉 Credits

Built with:
- Express.js
- MongoDB
- Steam Node.js libraries
- Telegram Web App SDK
- TailwindCSS

---

**Happy Trading! 🎮💎**
