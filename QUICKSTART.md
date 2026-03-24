# Quick Start Guide - Photography Marketplace

Get your Photography Marketplace up and running in 10 minutes!

## 📦 Prerequisites Check

Make sure you have:
- ✅ Node.js v18+ installed (`node --version`)
- ✅ PostgreSQL v14+ installed and running
- ✅ Git installed

## 🚀 5-Minute Setup (Development Mode)

### Step 1: Backend Setup (2 minutes)

\`\`\`bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database - CHANGE THIS!
DATABASE_URL=postgresql://postgres:password@localhost:5432/photomarket

# JWT Secrets - CHANGE THIS IN PRODUCTION!
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=dev-refresh-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# MinIO - Local object storage
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_REGION=us-east-1
MINIO_FORCE_PATH_STYLE=true
PREVIEW_BUCKET_NAME=preview-assets
ORIGINAL_BUCKET_NAME=original-assets
PREVIEW_PUBLIC_BASE_URL=http://localhost:9000/preview-assets
ORIGINAL_PUBLIC_BASE_URL=http://localhost:9000/original-assets

# Razorpay - Use test credentials
RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret

# Google AdSense - Optional
GOOGLE_ADSENSE_CLIENT_ID=
EOL

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start backend
npm run dev
\`\`\`

✅ Backend running on http://localhost:5000

### Step 2: Frontend Setup (2 minutes)

Open new terminal:

\`\`\`bash
# From project root
cd ..

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_ADSENSE_CLIENT_ID=
EOL

# Start frontend
npm run dev
\`\`\`

✅ Frontend running on http://localhost:5173

### Step 3: Test It! (1 minute)

1. Open http://localhost:5173
2. Click "Login"
3. Use seeded credentials:
   - **Admin:** admin@gmail.com / admin123
4. Browse products, add to cart, test checkout!

## 🎯 What's Working Now?

### ✅ Fully Functional
- User registration & login
- Product browsing with filters
- Shopping cart
- Categories
- User profiles
- Admin panel (/admin - login as admin)

### ⚠️ Needs Configuration
- **Payments** - Need real Razorpay keys
- **File Uploads** - Need MinIO (or S3-compatible) storage running
- **Email** - Not configured (future feature)
- **Google Ads** - Need AdSense client ID

## 🧪 Test Payment Flow (Without Real Razorpay)

Currently, the payment will fail without valid Razorpay credentials. To test the full flow:

1. Sign up for Razorpay Test Account: https://dashboard.razorpay.com/signup
2. Get Test API keys from dashboard
3. Update backend/.env with test keys:
   \`\`\`
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
   \`\`\`
4. Restart backend server
5. Test payment with Razorpay test card: 4111 1111 1111 1111

## 📸 Test MinIO Storage (File Uploads)

For local testing:

1. Start MinIO (Docker Compose recommended)
2. Ensure `preview-assets` and `original-assets` buckets exist
3. Keep preview bucket public-read for image previews
4. Verify `.env` MinIO credentials and endpoint
5. Restart backend

## 🎨 Enable Google Ads

1. Sign up for Google AdSense: https://www.google.com/adsense/
2. Get your Publisher ID (ca-pub-xxxxxxxxxxxxxxxx)
3. Update both .env files:
   
   Frontend:
   \`\`\`
   VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
   \`\`\`
   
   Backend:
   \`\`\`
   GOOGLE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
   \`\`\`
4. Restart both servers
5. Configure ad placements in Admin Panel → Advertisements

## 🔧 Troubleshooting

### Database Connection Failed
\`\`\`bash
# Check PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app for PostgreSQL

# Create database manually
psql -U postgres
CREATE DATABASE photomarket;
\\q
\`\`\`

### Port Already in Use
\`\`\`bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
\`\`\`

### Module Not Found Errors
\`\`\`bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Do this for both frontend and backend
\`\`\`

### Prisma Errors
\`\`\`bash
cd backend

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Regenerate client
npm run prisma:generate
\`\`\`

## 📚 Next Steps

1. **Read Full Docs**: Check README.md for complete features
2. **Explore Admin Panel**: Login as admin, manage products
3. **API Documentation**: See openapi.yaml for all endpoints
4. **Customize**: Modify frontend components, add features
5. **Deploy**: Follow deployment guide in README.md

## 🎉 You're Ready!

Your Photography Marketplace is running! Start building awesome features.

**Need Help?**
- Check README.md for detailed documentation
- Review openapi.yaml for API specs
- Open GitHub issue for bugs

Happy coding! 🚀
