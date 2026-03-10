# 🚦 Startup Checklist - Fix Network Errors

Follow these steps in order to get your application running without errors.

## ✅ Step 1: Check PostgreSQL is Running

**macOS (with Homebrew):**
\`\`\`bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# If not running, start it
brew services start postgresql@14

# Or if you have a different version
brew services start postgresql
\`\`\`

**Linux (Ubuntu/Debian):**
\`\`\`bash
# Check status
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql
\`\`\`

**Windows:**
- Open Services app (Win + R, type `services.msc`)
- Find "PostgreSQL" service
- Make sure it's running
- If not, right-click and select "Start"

## ✅ Step 2: Create Database

\`\`\`bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE photomarket;

# List databases to confirm (should see photomarket)
\l

# Exit
\q
\`\`\`

**Note:** If you get "psql: command not found", PostgreSQL CLI tools aren't in PATH.
- **macOS:** Add to PATH: `export PATH="/usr/local/opt/postgresql@14/bin:$PATH"`
- **Windows:** Use pgAdmin or SQL Shell from Start menu

## ✅ Step 3: Update Backend .env File

Edit `/backend/.env` and update the DATABASE_URL:

\`\`\`env
# If your PostgreSQL username is 'postgres' and password is 'password':
DATABASE_URL=postgresql://postgres:password@localhost:5432/photomarket

# If different username/password:
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/photomarket

# If no password (not recommended):
DATABASE_URL=postgresql://postgres@localhost:5432/photomarket
\`\`\`

**Common PostgreSQL defaults:**
- **macOS Homebrew:** User: `postgres`, Password: (none or empty)
- **Windows:** User: `postgres`, Password: (set during installation)
- **Linux:** User: `postgres`, Password: (set during installation)

## ✅ Step 4: Install Backend Dependencies

\`\`\`bash
cd backend

# Install all packages
npm install

# This should complete without errors
\`\`\`

## ✅ Step 5: Setup Database Schema

\`\`\`bash
# Still in /backend directory

# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# When prompted for migration name, type: "init" and press Enter

# Seed initial data (creates admin user, categories, etc.)
npm run prisma:seed
\`\`\`

**Expected output:**
\`\`\`
✅ Admin user created
✅ Test user created
✅ Categories created
✅ Google Ad settings created
🎉 Seeding completed successfully!
\`\`\`

## ✅ Step 6: Start Backend Server

\`\`\`bash
# Still in /backend directory
npm run dev
\`\`\`

**Expected output:**
\`\`\`
✅ Database connected successfully
🚀 Server is running on port 5000
📍 Environment: development
🌐 Client URL: http://localhost:5173
\`\`\`

**⚠️ If you see errors:**

### Error: "Can't reach database server"
- PostgreSQL is not running → Go to Step 1
- Wrong credentials in DATABASE_URL → Go to Step 3

### Error: "Port 5000 already in use"
\`\`\`bash
# Kill the process using port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Then start server again
npm run dev
\`\`\`

## ✅ Step 7: Test Backend API

Open a new terminal and test:

\`\`\`bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
# {"success":true,"message":"Photography Marketplace API is running","timestamp":"..."}
\`\`\`

**Or open in browser:** http://localhost:5000/health

## ✅ Step 8: Install Frontend Dependencies

Open a **new terminal** (keep backend running):

\`\`\`bash
# From project root (not backend folder)
npm install
\`\`\`

## ✅ Step 9: Check Frontend .env File

Make sure `/.env` exists with:

\`\`\`env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_ADSENSE_CLIENT_ID=
\`\`\`

**The file should already exist.** If not, create it with the above content.

## ✅ Step 10: Start Frontend

\`\`\`bash
# From project root
npm run dev
\`\`\`

**Expected output:**
\`\`\`
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
\`\`\`

## ✅ Step 11: Test in Browser

1. Open http://localhost:5173
2. **You should NOT see network errors in console**
3. Click "Login"
4. Try logging in with:
   - **Email:** admin@photomarket.com
   - **Password:** admin

**Expected:** Successful login, redirected to dashboard

## 🐛 Troubleshooting Common Errors

### "NetworkError when attempting to fetch resource"

**Cause:** Backend is not running or frontend can't reach it

**Fix:**
1. Make sure backend is running (Step 6)
2. Check backend terminal for errors
3. Test backend health endpoint (Step 7)
4. Check if `.env` has correct API URL (Step 9)

### "SyntaxError: JSON.parse: unexpected character"

**Cause:** API returned HTML error page instead of JSON

**Fix:**
1. Backend has crashed - check backend terminal for errors
2. Wrong API URL in frontend `.env`
3. CORS issue - check backend CORS settings

### "Failed to load user"

**Cause:** Normal on first load when not logged in

**Fix:** This is not an error! It's expected when user is not authenticated.

### Prisma Migration Errors

**Error:** "Migration failed"

**Fix:**
\`\`\`bash
cd backend

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# This will:
# - Drop the database
# - Create it again
# - Run all migrations
# - Run seed script
\`\`\`

### Port Already in Use (Frontend)

\`\`\`bash
# Kill process on port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
\`\`\`

## 📊 Verify Everything is Working

### Backend Checklist:
- [ ] PostgreSQL is running
- [ ] Database "photomarket" exists
- [ ] Backend server running on port 5000
- [ ] Health endpoint returns JSON: http://localhost:5000/health
- [ ] No errors in backend terminal

### Frontend Checklist:
- [ ] Frontend server running on port 5173
- [ ] Browser opens http://localhost:5173
- [ ] No network errors in browser console
- [ ] Can see homepage with products
- [ ] Can click login and see login form

## 🎉 Success!

If all checks pass:
- ✅ Backend is connected to database
- ✅ Frontend is connected to backend
- ✅ No network errors
- ✅ Ready to develop!

## 🆘 Still Having Issues?

1. **Check both terminal windows** - backend and frontend should both be running
2. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check browser console** - Open DevTools (F12) and check Console tab for errors
4. **Restart everything:**
   \`\`\`bash
   # Stop both servers (Ctrl+C in both terminals)
   # Then start again:
   
   # Terminal 1 - Backend:
   cd backend && npm run dev
   
   # Terminal 2 - Frontend:
   npm run dev
   \`\`\`

## 📝 Quick Reference

**Default Login Credentials (after seeding):**
- Admin: admin@photomarket.com / admin
- User: john.doe@example.com / password123

**Default Ports:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

**Key Commands:**
\`\`\`bash
# Backend
cd backend
npm run dev              # Start backend
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database

# Frontend
npm run dev              # Start frontend
\`\`\`

---

**Still stuck?** Check the error message carefully and follow the specific fix above.
