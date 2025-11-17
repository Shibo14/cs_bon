# 🚀 Bepul Hostingga Deploy Qilish (O'zbekcha)

Bot Token: `8583459896:AAEfW-wY9am4DS8Yibypmi8zH3KbFbuj9fo`

---

## ⚡ Eng Oson Yo'l (Avtomatik)

### 1. MongoDB Atlas (Bepul ma'lumotlar bazasi)

**A) Ro'yxatdan o'tish:**
1. https://www.mongodb.com/cloud/atlas/register ga kiring
2. Email va parol bilan ro'yxatdan o'ting
3. **Free Shared** (M0) ni tanlang
4. Cloud provider: **AWS** yoki **Google Cloud**
5. Region: **Frankfurt (eu-central-1)** yoki yaqin hudud
6. "Create Cluster" bosing (3-5 daqiqa kutish)

**B) Database user yaratish:**
1. Chap menuda **Database Access** ni tanlang
2. "Add New Database User" bosing
3. Username: `admin`
4. Password: Parol yarating va yozib oling
5. "Add User" bosing

**C) Network Access:**
1. Chap menuda **Network Access** ni tanlang
2. "Add IP Address" bosing
3. "Allow Access from Anywhere" (0.0.0.0/0)
4. "Confirm" bosing

**D) Connection String olish:**
1. **Database → Connect** bosing
2. "Connect your application" tanlang
3. **Node.js** va **4.1 or later** versiyani tanlang
4. Connection string ni nusxalang:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/telegram_case_opener?retryWrites=true&w=majority
   ```
5. `<password>` ni o'zingizning parolingiz bilan almashtiring

---

### 2. Avtomatik Deploy Skript

```bash
cd /home/user/cs_bon/project

# Deploy skriptni ishga tushirish
./deploy.sh
```

Skript:
1. ✅ Railway va Netlify CLI ni o'rnatadi
2. ✅ MongoDB connection string so'raydi (yuqorida olgan stringni kiriting)
3. ✅ Backend'ni Railway ga deploy qiladi
4. ✅ Frontend'ni Netlify ga deploy qiladi
5. ✅ Barcha URL'larni ko'rsatadi

---

## 🔧 Qo'lda Deploy (Agar avtomatik ishlamasa)

### Qadam 1: Railway (Backend)

```bash
# Railway CLI o'rnatish
npm install -g @railway/cli

# Login
railway login
```

Browser ochiladi, **GitHub** orqali login qiling.

```bash
# Backend papkasiga o'tish
cd /home/user/cs_bon/project/backend

# Project yaratish
railway init

# Ism bering: telegram-case-backend
```

**Environment variables qo'shish:**

Railway veb sahifasini oching: https://railway.app/dashboard

1. Projectingizni tanlang
2. **Variables** tabga o'ting
3. Quyidagilarni qo'shing:

```
MONGODB_URI=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/telegram_case_opener
TELEGRAM_BOT_TOKEN=8583459896:AAEfW-wY9am4DS8Yibypmi8zH3KbFbuj9fo
PORT=3000
NODE_ENV=production
DEFAULT_CRYSTALS=100
```

**Deploy:**
```bash
railway up
```

**URL olish:**
```bash
railway status
```

URL ko'rinadi: `https://telegram-case-backend-production.up.railway.app`

---

### Qadam 2: Netlify (Frontend)

```bash
# Netlify CLI o'rnatish
npm install -g netlify-cli

# Login
netlify login
```

Browser ochiladi, login qiling.

**Frontend'ni yangilash:**

`miniapp/scripts/app.js` faylini oching va o'zgartiring:

```javascript
// OLDINGI:
const API_BASE_URL = 'http://localhost:3000/api';

// YANGI (Railway URL'ingiz):
const API_BASE_URL = 'https://telegram-case-backend-production.up.railway.app/api';
```

**Deploy:**
```bash
cd /home/user/cs_bon/project/miniapp

netlify deploy --prod
```

Savollar:
- **Publish directory**: `.` (nuqta)
- Tasdiqlang: `yes`

URL oling: `https://yourapp.netlify.app`

---

### Qadam 3: Ma'lumotlar bazasini to'ldirish

Railway dashboard'da:

1. **telegram-case-backend** projectingizni oching
2. **Deployments** tabga o'ting
3. Oxirgi deployment'ni tanlang
4. **View Logs** bosing
5. O'ng yuqorida **Terminal** ikonkasini bosing

Terminal ochiladi, kiriting:

```bash
cd /app
node scripts/seed_database.js
```

Natija:
```
✅ Connected to MongoDB
✅ Saved 10 new skins
✅ Created Budget Case
...
```

---

### Qadam 4: BotFather'da sozlash

Telegram'da **@BotFather** ga o'ting:

```
/mybots
```

1. Botingizni tanlang
2. **Bot Settings** → **Menu Button**
3. **Edit Menu Button URL**
4. URL kiriting:
   ```
   https://yourapp.netlify.app/index.html
   ```
5. **Menu Button Text**: `🎮 Open App`

---

### Qadam 5: Test qilish

1. Telegram'da botingizni oching
2. `/start` yuboring
3. Pastdagi **Menu** tugmasini bosing (yoki 🎮 ikonka)
4. Mini App ochilishi kerak
5. Balance: 100 💎
6. "Cases" ga o'ting
7. Biror case'ni oching!

---

## 🎯 Qisqacha Yo'riqnoma

```bash
# 1. MongoDB Atlas (bepul)
# → https://www.mongodb.com/cloud/atlas/register
# → Connection string oling

# 2. Railway CLI
npm install -g @railway/cli
railway login

cd project/backend
railway init
# → Railway dashboard'da variables qo'shing
railway up

# 3. Netlify CLI
npm install -g netlify-cli
netlify login

# miniapp/scripts/app.js'da API_BASE_URL'ni yangilang
cd project/miniapp
netlify deploy --prod

# 4. BotFather'da Web App URL sozlang
# 5. Telegram'da test qiling!
```

---

## 💰 Bepul Limitlar

| Servis | Bepul Limit | Yetarlimi? |
|--------|-------------|------------|
| **MongoDB Atlas** | 512 MB | ✅ Yetadi (ming foydalanuvchi) |
| **Railway** | 500 soat/oy | ✅ Yetadi (~20 kun 24/7) |
| **Netlify** | 100 GB bandwidth | ✅ Yetadi (ming ochish) |

**Xulosa:** 1000-5000 foydalanuvchi uchun to'liq bepul!

---

## ❓ Tez-tez So'raladigan Savollar

**Railway'da pul so'rayaptimi?**
- Yo'q, faqat credit card verify qilish uchun (hech narsa olinmaydi)
- Yoki GitHub Student Pack bilan 100% bepul

**Bot ishlamayapti?**
```bash
# Railway logs tekshiring:
railway logs

# Netlify logs:
netlify logs
```

**Ma'lumotlar bazasi bo'sh?**
```bash
# Railway terminal'da:
node scripts/seed_database.js
```

**Frontend backend'ga ulanmayapti?**
- `miniapp/scripts/app.js` da `API_BASE_URL` to'g'rimi?
- Railway URL oxirida `/api` bormi?
- Railway backend ishlayaptimi? (logs tekshiring)

---

## 🔥 Muqobil Bepul Variantlar

### Render.com (Railway o'rniga)
- 750 soat/oy bepul
- Credit card shart emas
- https://render.com

### Vercel (Netlify o'rniga)
- Unlimited deployments
- https://vercel.com

### Fly.io
- 3 VM bepul
- https://fly.io

---

## 📞 Yordam

Agar qiynalayotgan bo'lsangiz:

1. **Railway Logs:** `railway logs`
2. **Netlify Logs:** `netlify logs`
3. **MongoDB Logs:** Atlas dashboard → Metrics

Xato topilsa, menga yozing!

---

## ✅ Deploy Checklist

- [ ] MongoDB Atlas cluster yaratdim
- [ ] Connection string oldim
- [ ] Railway'ga backend deploy qildim
- [ ] Railway'da variables qo'shdim
- [ ] Ma'lumotlar bazasini to'ldirdim (seed)
- [ ] Frontend'da API URL'ni yangiladim
- [ ] Netlify'ga frontend deploy qildim
- [ ] BotFather'da Web App URL sozladim
- [ ] Telegram'da test qildim
- [ ] Ishlayapti! 🎉

---

**Omad! Savollar bo'lsa, so'rang! 🚀**
