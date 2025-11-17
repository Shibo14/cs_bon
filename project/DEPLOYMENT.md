# Deployment Guide

Complete guide for deploying the Telegram CS:GO Case Opener to production.

## 🌐 Architecture Overview

```
┌─────────────────┐
│  Telegram User  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Telegram Bot   │
│   (BotFather)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   Mini App      │◄────►│   Backend    │
│   (Frontend)    │      │   API Server │
│  Netlify/Vercel │      │ Railway/Render│
└─────────────────┘      └──────┬───────┘
                                │
                    ┌───────────┼──────────┐
                    ▼           ▼          ▼
              ┌──────────┐ ┌────────┐ ┌─────────┐
              │ MongoDB  │ │ Steam  │ │Payment  │
              │  Atlas   │ │  Bot   │ │Gateway  │
              └──────────┘ └────────┘ └─────────┘
```

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] Telegram bot created via BotFather
- [ ] Steam account with API key
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (provided by hosting platforms)

## 1️⃣ Database Setup (MongoDB Atlas)

### Create Free Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (Free M0 tier available)
4. Choose a region close to your users

### Configure Database Access

1. **Database Access**:
   - Create database user
   - Set username and password
   - Save credentials securely

2. **Network Access**:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, whitelist only your server IPs

3. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/telegram_case_opener`

## 2️⃣ Backend Deployment (Railway)

### Option A: Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   cd backend
   railway init
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set PORT=3000
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI="your_mongodb_atlas_uri"
   railway variables set TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
   railway variables set DEFAULT_CRYSTALS=100
   railway variables set CASE_OPENING_COST=10
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Get Deployment URL**:
   - Railway will provide a URL like: `https://yourapp.railway.app`
   - Save this URL for frontend configuration

### Option B: Deploy to Render

1. **Create Account**: Go to [Render](https://render.com)

2. **New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**:
   - **Name**: telegram-case-backend
   - **Environment**: Node
   - **Region**: Choose closest to users
   - **Branch**: main
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`

4. **Environment Variables**:
   Add all variables from `.env.example`:
   ```
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   DEFAULT_CRYSTALS=100
   CASE_OPENING_COST=10
   ```

5. **Deploy**: Click "Create Web Service"

6. **Get URL**: Render provides URL like `https://yourapp.onrender.com`

## 3️⃣ Steam Bot Deployment

### Deploy as Separate Service

The Steam bot needs to run continuously and separately from the backend API.

#### Railway Deployment

1. **Create New Service**:
   ```bash
   cd steam-bot
   railway init
   ```

2. **Set Environment Variables**:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI="your_mongodb_atlas_uri"
   railway variables set STEAM_USERNAME="your_steam_username"
   railway variables set STEAM_PASSWORD="your_steam_password"
   railway variables set STEAM_SHARED_SECRET="your_shared_secret"
   railway variables set STEAM_IDENTITY_SECRET="your_identity_secret"
   railway variables set STEAM_API_KEY="your_steam_api_key"
   ```

3. **Deploy**:
   ```bash
   railway up
   ```

#### Render Deployment

1. Create new "Background Worker" service
2. Connect same repository
3. Configure:
   - **Root Directory**: steam-bot
   - **Build Command**: `npm install`
   - **Start Command**: `node bot.js`
4. Add all Steam-related environment variables

### Important Notes for Steam Bot

- Keep bot running 24/7
- Monitor logs for errors
- Ensure Steam account has Steam Guard enabled
- Add items to bot's inventory for withdrawals

## 4️⃣ Frontend Deployment

### Option A: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   cd miniapp
   netlify deploy --prod
   ```

3. **Configure**:
   - Drag and drop the `miniapp` folder
   - Or connect GitHub repository
   - Set publish directory: `miniapp`

4. **Get URL**: Netlify provides URL like `https://yourapp.netlify.app`

### Option B: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd miniapp
   vercel --prod
   ```

3. **Or use Vercel Dashboard**:
   - Import repository
   - Set root directory to `miniapp`
   - Deploy

### Option C: GitHub Pages

1. **Create `gh-pages` branch**:
   ```bash
   git checkout -b gh-pages
   git add miniapp/*
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

2. **Enable GitHub Pages**:
   - Repository → Settings → Pages
   - Source: gh-pages branch
   - Folder: / (root)

3. **Access**: `https://yourusername.github.io/repository-name/`

## 5️⃣ Update Frontend Configuration

After deploying backend, update the frontend:

1. **Edit `miniapp/scripts/app.js`**:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.railway.app/api';
   ```

2. **Redeploy frontend** with updated URL

## 6️⃣ Telegram Bot Configuration

### Set Web App URL

1. Open Telegram and go to [@BotFather](https://t.me/BotFather)

2. **Create or Edit App**:
   ```
   /myapps
   → Select your bot
   → Edit Web App URL
   → Enter: https://your-frontend-url.netlify.app/index.html
   ```

3. **Set Bot Commands** (optional):
   ```
   /setcommands
   → Select your bot
   → Enter:
   start - Start the bot
   balance - Check your balance
   inventory - View your inventory
   ```

4. **Add Menu Button**:
   ```
   /setmenubutton
   → Select your bot
   → Choose "Web App"
   → URL: https://your-frontend-url.netlify.app/index.html
   ```

## 7️⃣ Initialize Database

After all services are deployed:

1. **SSH into backend service** or run locally with production DB:
   ```bash
   # Update .env with production MONGODB_URI
   node scripts/seed_database.js
   ```

2. **Verify**:
   - Check MongoDB Atlas → Collections
   - Should see `skins` and `cases` collections populated

## 8️⃣ Testing Deployment

### Test Backend API

```bash
# Health check
curl https://your-backend-url.railway.app/health

# Get cases (should work without auth)
curl https://your-backend-url.railway.app/api/cases
```

### Test Mini App

1. Open your Telegram bot
2. Click the menu button or send `/start`
3. Mini App should open
4. Try:
   - Viewing balance
   - Opening a case
   - Checking inventory

### Test Steam Bot

1. Check logs in Railway/Render dashboard
2. Should see:
   ```
   ✅ Logged into Steam
   ✅ Connected to MongoDB
   ✅ Trade Manager cookies set
   ```

3. Create a test withdrawal:
   - Open a case in Mini App
   - Go to inventory
   - Set Steam trade URL
   - Click "Withdraw Skin"
   - Check bot logs for trade offer creation

## 9️⃣ Custom Domain (Optional)

### For Backend (Railway)

1. Railway Dashboard → Settings → Domains
2. Add custom domain: `api.yourdomain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: <railway-provided-cname>
   ```

### For Frontend (Netlify)

1. Netlify Dashboard → Domain Settings
2. Add custom domain: `app.yourdomain.com`
3. Configure DNS as instructed

### Update Configurations

After setting custom domains:

1. Update `API_BASE_URL` in frontend
2. Update CORS settings in backend if needed
3. Update Web App URL in BotFather

## 🔒 Production Security

### Backend

1. **Enable CORS** only for your frontend domain:
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-url.netlify.app'
   }));
   ```

2. **Rate Limiting**:
   ```bash
   npm install express-rate-limit
   ```
   ```javascript
   const rateLimit = require('express-rate-limit');

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.use('/api/', limiter);
   ```

3. **Helmet.js** for security headers:
   ```bash
   npm install helmet
   ```
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

### Database

1. Use strong passwords
2. Enable MongoDB backup
3. Whitelist specific IPs in production
4. Enable audit logs

### Steam Bot

1. Use dedicated Steam account
2. Enable Steam Guard Mobile Authenticator
3. Use separate account from personal
4. Keep credentials encrypted

## 📊 Monitoring

### Backend Monitoring

1. **Railway/Render Built-in**:
   - CPU usage
   - Memory usage
   - Request logs
   - Error logs

2. **Add Logging Service** (optional):
   - [Logtail](https://betterstack.com/logtail)
   - [Papertrail](https://www.papertrail.com/)
   - [Datadog](https://www.datadoghq.com/)

### Database Monitoring

1. MongoDB Atlas Dashboard:
   - Connection count
   - Query performance
   - Storage usage

### Steam Bot Monitoring

1. Check logs regularly
2. Set up alerts for errors
3. Monitor trade offer success rate

## 🚨 Troubleshooting

### Backend Won't Start

- Check environment variables are set
- Verify MongoDB connection string
- Check logs for specific errors

### Frontend Can't Connect to Backend

- Verify CORS settings
- Check `API_BASE_URL` is correct
- Test API endpoints directly

### Steam Bot Login Failed

- Verify Steam credentials
- Check 2FA secrets are correct
- Ensure Steam Guard is enabled

### Trades Not Sending

- Verify bot has items in inventory
- Check trade URL format
- Ensure Steam API key is valid

## 📈 Scaling

As your app grows:

1. **Upgrade Database**: MongoDB Atlas M10+ tier
2. **Upgrade Backend**: More RAM/CPU on hosting platform
3. **Add Caching**: Redis for frequently accessed data
4. **Load Balancing**: Multiple backend instances
5. **CDN**: CloudFlare for static assets

## 💰 Cost Estimates

**Free Tier (0-100 users)**:
- MongoDB Atlas: Free (M0)
- Railway/Render: Free tier
- Netlify/Vercel: Free
- **Total: $0/month**

**Small Scale (100-1000 users)**:
- MongoDB Atlas: M2 ($9/month)
- Railway: Hobby ($5/month)
- Netlify: Free
- **Total: ~$14/month**

**Medium Scale (1000-10000 users)**:
- MongoDB Atlas: M10 ($57/month)
- Railway: Pro ($20/month)
- CDN: $5-10/month
- **Total: ~$82-92/month**

---

**Deployment Complete! 🎉**

Your Telegram CS:GO Case Opener is now live in production!
