# Project Structure

Complete file tree of the Telegram CS:GO Case Opener application.

```
project/
│
├── 📄 package.json                    # Root package.json with scripts
├── 📄 .env.example                    # Environment variables template
├── 📄 .gitignore                      # Git ignore rules
├── 📄 README.md                       # Main documentation
├── 📄 QUICKSTART.md                   # Quick start guide
├── 📄 DEPLOYMENT.md                   # Deployment guide
├── 📄 PROJECT_STRUCTURE.md            # This file
│
├── 🐳 docker-compose.yml              # Docker compose configuration
├── 🐳 Dockerfile.backend              # Backend Docker image
├── 🐳 Dockerfile.steambot             # Steam bot Docker image
│
├── 📁 backend/                        # Backend API Server
│   ├── 📄 package.json                # Backend dependencies
│   ├── 📄 app.js                      # Main Express application
│   │
│   ├── 📁 config/                     # Configuration files
│   │   └── 📄 database.js             # MongoDB connection setup
│   │
│   ├── 📁 middleware/                 # Express middleware
│   │   ├── 📄 auth.js                 # Telegram authentication
│   │   └── 📄 errorHandler.js         # Global error handler
│   │
│   ├── 📁 models/                     # MongoDB schemas
│   │   ├── 📄 User.js                 # User model
│   │   ├── 📄 Skin.js                 # Skin model
│   │   ├── 📄 Case.js                 # Case model
│   │   ├── 📄 Inventory.js            # Inventory model
│   │   └── 📄 WithdrawRequest.js      # Withdraw request model
│   │
│   ├── 📁 controllers/                # Request handlers
│   │   ├── 📄 userController.js       # User endpoints
│   │   ├── 📄 caseController.js       # Case endpoints
│   │   ├── 📄 inventoryController.js  # Inventory endpoints
│   │   ├── 📄 withdrawController.js   # Withdraw endpoints
│   │   └── 📄 paymentController.js    # Payment endpoints
│   │
│   ├── 📁 services/                   # Business logic
│   │   ├── 📄 userService.js          # User operations
│   │   ├── 📄 caseService.js          # Case operations
│   │   ├── 📄 inventoryService.js     # Inventory operations
│   │   └── 📄 withdrawService.js      # Withdraw operations
│   │
│   └── 📁 routes/                     # API routes
│       ├── 📄 userRoutes.js           # User routes
│       ├── 📄 caseRoutes.js           # Case routes
│       ├── 📄 inventoryRoutes.js      # Inventory routes
│       ├── 📄 withdrawRoutes.js       # Withdraw routes
│       └── 📄 paymentRoutes.js        # Payment routes
│
├── 📁 steam-bot/                      # Steam Trading Bot
│   ├── 📄 package.json                # Bot dependencies
│   ├── 📄 bot.js                      # Main bot logic
│   │
│   ├── 📁 config/                     # Bot configuration
│   │   └── 📄 config.js               # Steam credentials config
│   │
│   └── 📁 helpers/                    # Helper utilities
│       ├── 📄 logger.js               # Logging utility
│       └── 📄 steamHelper.js          # Steam utility functions
│
├── 📁 miniapp/                        # Telegram Mini App (Frontend)
│   ├── 📄 index.html                  # Main HTML file
│   │
│   ├── 📁 scripts/                    # JavaScript files
│   │   └── 📄 app.js                  # Main app logic
│   │
│   ├── 📁 styles/                     # CSS files (empty - using Tailwind CDN)
│   │
│   └── 📁 assets/                     # Static assets (images, etc.)
│
└── 📁 scripts/                        # Utility scripts
    ├── 📄 fetch_skins.js              # Fetch skins from external APIs
    └── 📄 seed_database.js            # Seed database with initial data
```

## 📊 File Count Summary

- **Total Files**: 44
- **Backend Files**: 22
- **Steam Bot Files**: 5
- **Frontend Files**: 2
- **Scripts**: 2
- **Configuration**: 7
- **Documentation**: 4

## 🎯 Key Files Explained

### Root Level

| File | Purpose |
|------|---------|
| `package.json` | Root dependencies and scripts |
| `.env.example` | Template for environment variables |
| `README.md` | Main project documentation |
| `QUICKSTART.md` | Quick setup guide |
| `DEPLOYMENT.md` | Production deployment guide |
| `docker-compose.yml` | Docker orchestration |

### Backend (`/backend`)

| Directory/File | Purpose |
|----------------|---------|
| `app.js` | Express server entry point |
| `config/` | Database and app configuration |
| `middleware/` | Request interceptors (auth, errors) |
| `models/` | MongoDB schema definitions |
| `controllers/` | HTTP request handlers |
| `services/` | Business logic layer |
| `routes/` | API endpoint definitions |

### Steam Bot (`/steam-bot`)

| File | Purpose |
|------|---------|
| `bot.js` | Main bot application |
| `config/config.js` | Steam credentials setup |
| `helpers/logger.js` | Logging utility |
| `helpers/steamHelper.js` | Steam utility functions |

### Mini App (`/miniapp`)

| File | Purpose |
|------|---------|
| `index.html` | Single-page application |
| `scripts/app.js` | Frontend logic and API calls |

### Scripts (`/scripts`)

| File | Purpose |
|------|---------|
| `fetch_skins.js` | Fetch skins from Steam/Skinport API |
| `seed_database.js` | Initialize database with test data |

## 📝 Lines of Code

Approximate distribution:

- **Backend**: ~2,500 lines
- **Steam Bot**: ~600 lines
- **Frontend**: ~800 lines
- **Scripts**: ~400 lines
- **Documentation**: ~2,000 lines
- **Total**: ~6,300 lines

## 🔄 Data Flow

```
User (Telegram)
      ↓
Mini App (index.html + app.js)
      ↓
Backend API (app.js → routes → controllers → services)
      ↓
MongoDB (models)
      ↓
Steam Bot (bot.js)
      ↓
Steam Trade API
```

## 🎨 Architecture Pattern

**Backend**: MVC (Model-View-Controller) + Services

```
Request → Route → Controller → Service → Model → Database
                                ↓
                            Response
```

**Frontend**: Single Page Application (SPA)

```
User Action → JavaScript → API Call → Update UI
```

**Steam Bot**: Event-Driven Architecture

```
Database Poll → Process Queue → Steam API → Update Database
Steam Events → Handle Changes → Update Database
```

## 🔐 Security Layers

1. **Telegram Authentication** (middleware/auth.js)
   - Validates Telegram WebApp initData
   - Verifies request signature

2. **Input Validation** (controllers/)
   - Validates all user inputs
   - Prevents injection attacks

3. **Error Handling** (middleware/errorHandler.js)
   - Catches and sanitizes errors
   - Prevents information leakage

4. **Environment Variables** (.env)
   - Secure credential storage
   - Never committed to repository

## 🚀 Entry Points

| Service | Entry Point | Port |
|---------|-------------|------|
| Backend API | `backend/app.js` | 3000 |
| Steam Bot | `steam-bot/bot.js` | N/A |
| Mini App | `miniapp/index.html` | N/A (static) |

## 📦 Dependencies

### Backend
- express
- mongoose
- cors
- dotenv
- body-parser
- morgan

### Steam Bot
- steam-user
- steamcommunity
- steam-tradeoffer-manager
- steam-totp
- mongoose

### Frontend
- Telegram Web App SDK (CDN)
- Tailwind CSS (CDN)

## 🎯 Module Responsibilities

### Backend Modules

| Module | Responsibility |
|--------|----------------|
| User | User management, authentication |
| Case | Case management, opening logic |
| Inventory | Item storage, tracking |
| Withdraw | Withdrawal requests, processing |
| Payment | Payment integration (mock) |

### Steam Bot Modules

| Module | Responsibility |
|--------|----------------|
| bot.js | Main orchestration, polling |
| steamHelper | Steam utility functions |
| logger | Centralized logging |

---

**Last Updated**: 2024
**Version**: 1.0.0
