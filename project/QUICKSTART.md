# Quick Start Guide

Get the Telegram CS:GO Case Opener running in 5 minutes!

## ⚡ Fast Setup (Local Development)

### 1. Install MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 2. Clone & Install

```bash
cd project
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` - **Minimum required:**
```env
MONGODB_URI=mongodb://localhost:27017/telegram_case_opener
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
```

**Note:** Steam bot features will work in mock mode without Steam credentials for initial testing.

### 4. Seed Database

```bash
node scripts/seed_database.js
```

You should see:
```
✅ Connected to MongoDB
✅ Saved 10 new skins
✅ Created Budget Case
✅ Created Premium Case
✅ Created Legendary Case
```

### 5. Start Backend

```bash
npm run backend
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 3000
```

### 6. Test API

Open http://localhost:3000/health in your browser.

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 7. Open Mini App

Open `miniapp/index.html` in your browser (for local testing).

For full Telegram integration, you'll need to:
1. Host the frontend (use ngrok for quick testing)
2. Configure the Web App URL in BotFather

## 🔧 Quick Testing Without Telegram

You can test the API directly using curl or Postman:

### Get Cases
```bash
curl http://localhost:3000/api/cases
```

### Get Specific Case
```bash
curl http://localhost:3000/api/cases/{case_id}
```

## 🚀 Quick Deploy with Docker

```bash
# Copy and edit environment variables
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker-compose up -d

# Seed database
docker-compose exec backend node /app/scripts/seed_database.js

# View logs
docker-compose logs -f
```

## 🌐 Quick Deploy to Cloud (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Get the URL
railway status

# Set environment variables through Railway dashboard
# Then seed the database using Railway's shell
```

## 📱 Quick Telegram Bot Setup

### 1. Create Bot

1. Open Telegram, search for [@BotFather](https://t.me/BotFather)
2. Send: `/newbot`
3. Follow instructions
4. Copy the bot token to your `.env` file

### 2. Test Bot

1. Send `/start` to your bot
2. You should get a welcome message

### 3. Add Web App (After Frontend Deployment)

1. Send to BotFather: `/newapp`
2. Select your bot
3. Provide app details
4. Set Web App URL: `https://your-frontend-url.com/index.html`

## 🎮 Quick Test Flow

1. **Start services**: `npm run dev`
2. **Open Mini App** in Telegram
3. **Check balance**: Should see 100 crystals
4. **View cases**: Should see 3 cases
5. **Open a case**: Click "Open" on Budget Case
6. **View inventory**: Check your won item
7. **Try withdrawal**: Click "Withdraw Skin"

## 🐛 Quick Troubleshooting

**MongoDB connection failed?**
```bash
# Check MongoDB is running
mongod --version
# On macOS: brew services list
# On Linux: sudo systemctl status mongodb
```

**Port 3000 already in use?**
```bash
# Change PORT in .env
PORT=3001
```

**Can't open case?**
```bash
# Check if database is seeded
mongo telegram_case_opener --eval "db.cases.count()"
# Should return 3 or more
```

**Frontend can't connect?**
- Check `API_BASE_URL` in `miniapp/scripts/app.js`
- Make sure it points to your backend URL
- Check CORS is enabled in backend

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Configure Steam bot for real item trading
- Set up payment integration
- Customize cases and skins

## 💡 Tips

1. **Start Simple**: Get the basic flow working first
2. **Test Locally**: Use the frontend in browser before Telegram
3. **Mock Data**: Use the provided mock skins/cases initially
4. **Logs**: Always check console logs for errors
5. **Incremental**: Add features one at a time

## ⚙️ Environment Variables Priority

**Essential (Required for basic functionality):**
- `MONGODB_URI`
- `TELEGRAM_BOT_TOKEN`

**Important (For full features):**
- `STEAM_USERNAME`
- `STEAM_PASSWORD`
- `STEAM_SHARED_SECRET`
- `STEAM_IDENTITY_SECRET`
- `STEAM_API_KEY`

**Optional (For extended features):**
- `SKINPORT_CLIENT_ID`
- `SKINPORT_CLIENT_SECRET`
- `DEFAULT_CRYSTALS`
- `CASE_OPENING_COST`

## 🎯 Success Checklist

- [ ] MongoDB running
- [ ] Backend API responding on /health
- [ ] Database seeded with cases and skins
- [ ] Can view cases via API
- [ ] Mini app loads in browser
- [ ] Telegram bot responding to /start
- [ ] Can open a case (in browser or Telegram)
- [ ] Can view inventory
- [ ] Steam bot logged in (optional)

---

**You're all set! Happy coding! 🚀**
