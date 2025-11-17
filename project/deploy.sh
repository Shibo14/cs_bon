#!/bin/bash

echo "🚀 Telegram Case Opener - Bepul Deploy"
echo "======================================"

# Ranglar
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check dependencies
echo -e "${BLUE}1. Dependency'larni tekshiryapman...${NC}"
command -v railway >/dev/null 2>&1 || {
    echo "Railway CLI o'rnatilmagan. O'rnatyapman..."
    npm install -g @railway/cli
}

command -v netlify >/dev/null 2>&1 || {
    echo "Netlify CLI o'rnatilmagan. O'rnatyapman..."
    npm install -g netlify-cli
}

# 2. MongoDB Atlas URL so'rash
echo -e "${BLUE}2. MongoDB Atlas connection string kiriting:${NC}"
echo "   (https://cloud.mongodb.com dan oling)"
read -p "MongoDB URI: " MONGODB_URI

# 3. Telegram Bot Token
TELEGRAM_BOT_TOKEN="8583459896:AAEfW-wY9am4DS8Yibypmi8zH3KbFbuj9fo"
echo -e "${GREEN}✅ Telegram Bot Token: ${TELEGRAM_BOT_TOKEN}${NC}"

# 4. Backend deploy (Railway)
echo -e "${BLUE}3. Backend'ni Railway ga deploy qilyapman...${NC}"
cd backend

railway login
railway init

# Set environment variables
railway variables set MONGODB_URI="${MONGODB_URI}"
railway variables set TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set DEFAULT_CRYSTALS=100

# Deploy
railway up

# Get Railway URL
BACKEND_URL=$(railway status | grep "URL" | awk '{print $2}')
echo -e "${GREEN}✅ Backend URL: ${BACKEND_URL}${NC}"

cd ..

# 5. Update frontend API URL
echo -e "${BLUE}4. Frontend'ni yangilyapman...${NC}"
sed -i "s|http://localhost:3000/api|${BACKEND_URL}/api|g" miniapp/scripts/app.js

# 6. Frontend deploy (Netlify)
echo -e "${BLUE}5. Frontend'ni Netlify ga deploy qilyapman...${NC}"
cd miniapp

netlify login
netlify deploy --prod

FRONTEND_URL=$(netlify status | grep "URL" | awk '{print $2}')
echo -e "${GREEN}✅ Frontend URL: ${FRONTEND_URL}${NC}"

cd ..

# 7. Instructions
echo ""
echo "======================================"
echo -e "${GREEN}✅ DEPLOY MUVAFFAQIYATLI!${NC}"
echo "======================================"
echo ""
echo "📱 BotFather'da quyidagilarni sozlang:"
echo ""
echo "1. Telegram'da @BotFather ga o'ting"
echo "2. /mybots buyrug'ini yuboring"
echo "3. Botingizni tanlang"
echo "4. Bot Settings → Menu Button → Edit Menu Button URL"
echo "5. Quyidagi URL ni kiriting:"
echo ""
echo -e "   ${GREEN}${FRONTEND_URL}/index.html${NC}"
echo ""
echo "======================================"
echo "🎉 Tayyor! Botingizni Telegram'da ishga tushiring!"
echo "======================================"
