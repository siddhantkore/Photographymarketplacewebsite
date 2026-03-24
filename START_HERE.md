# 🚀 START HERE - Quick Fix Guide

## ❌ You're Seeing These Errors:

```
API request failed: TypeError: NetworkError when attempting to fetch resource.
Failed to load user: TypeError: NetworkError when attempting to fetch resource.
SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
```

## ✅ Here's the Fix (Choose Your Path):

---

## 🎯 OPTION 1: Automated Setup (Recommended - 5 minutes)

### macOS / Linux:
```bash
# 1. Make script executable
chmod +x start-dev.sh

# 2. Run it
./start-dev.sh
```

### Windows:
```cmd
# Just double-click this file:
start-dev.bat

# Or run in Command Prompt:
start-dev.bat
```

**The script will:**
- ✅ Check PostgreSQL is running
- ✅ Install all dependencies
- ✅ Setup database
- ✅ Start both servers
- ✅ Open in browser

**Then:** Login with `admin@gmail.com` / `admin123`

---

## 🔧 OPTION 2: Manual Setup (10 minutes)

### Step 1: Start PostgreSQL

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Windows:**
- Win + R → type `services.msc` → Find PostgreSQL → Start

### Step 2: Create Database

```bash
psql -U postgres
CREATE DATABASE photomarket;
\q
```

### Step 3: Setup Backend

**Open Terminal 1:**
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

**Wait for:**
```
✅ Database connected successfully
🚀 Server is running on port 5000
```

### Step 4: Setup Frontend

**Open Terminal 2 (keep Terminal 1 running):**
```bash
npm install
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:5173/
```

### Step 5: Test

1. Open: http://localhost:5173
2. Login: `admin@gmail.com` / `admin123`
3. ✅ No more errors!

---

## 🐛 Still Have Errors?

### Error: "Can't connect to PostgreSQL"

**Fix:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not, start it (see Step 1 above)
```

### Error: "Port 5000 already in use"

**Fix:**
```bash
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Error: "Database 'photomarket' does not exist"

**Fix:**
```bash
psql -U postgres -c "CREATE DATABASE photomarket;"
```

### Error: "Module not found" or npm errors

**Fix:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Same for backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 More Help?

| Issue | Read This |
|-------|-----------|
| Need detailed steps | `STARTUP_CHECKLIST.md` |
| Understanding the errors | `ERROR_FIXES.md` |
| Quick overview | `FIXES_SUMMARY.md` |
| Full documentation | `README.md` |

---

## ✅ Verification Checklist

Your app is working when you see:

**Backend Terminal:**
```
✅ Database connected successfully
🚀 Server is running on port 5000
```

**Frontend Terminal:**
```
➜  Local:   http://localhost:5173/
```

**Browser:**
- ✅ No red banner at top
- ✅ Home/Explore pages load (products appear after admin uploads)
- ✅ Can login successfully
- ✅ No errors in console (press F12)

---

## 🎉 Default Credentials

After setup, login with:

**Admin:**
- Email: `admin@gmail.com`
- Password: `admin123`

---

## 💡 What Happens Next?

Once both servers are running:

1. **Frontend** (http://localhost:5173) connects to **Backend** (http://localhost:5000)
2. **Backend** connects to **PostgreSQL** (localhost:5432)
3. All API calls work properly
4. No more network errors! 🎉

---

## 🚦 Quick Status Check

**Is everything working?** Run this:

```bash
# Test backend
curl http://localhost:5000/health

# Should return:
# {"success":true,"message":"Photography Marketplace API is running"}
```

**If you get an error:** Backend is not running → Go to Step 3

---

## 📞 Common Questions

**Q: Do I need AWS/Razorpay to test?**
A: AWS is not required. MinIO is supported for local object storage. Razorpay test keys are required only for full payment flow testing.

**Q: Which terminal should I keep open?**
A: Both! Keep Terminal 1 (backend) and Terminal 2 (frontend) running while developing.

**Q: Can I close the browser?**
A: Yes, just keep the terminals running. Reopen http://localhost:5173 anytime.

**Q: How do I stop the servers?**
A: Press `Ctrl + C` in each terminal window.

---

## 🎯 TL;DR - Super Quick Start

```bash
# If you have PostgreSQL running and just want to start:

# Terminal 1:
cd backend && npm run dev

# Terminal 2:
npm run dev

# Browser:
http://localhost:5173

# Login:
admin@gmail.com / admin123
```

---

**💪 You got this! The errors will be gone in 5 minutes.**

Choose Option 1 (automated) or Option 2 (manual) and follow the steps. 

If stuck, read `STARTUP_CHECKLIST.md` for detailed help.

🎉 Happy coding!
