# Photography Marketplace - Full Stack Application

A comprehensive photography marketplace where a single admin can upload and sell digital products (photos, bundles, posters, typography, banners) to users who can browse, purchase, and download items in different resolutions (HD/Full HD/4K).

## 🚀 Features

### Frontend
- **React + TypeScript** with Vite
- **Tailwind CSS v4** for styling
- **React Router** for navigation
- **Responsive Design** - Mobile-first approach
- **Real-time Cart Management**
- **Product Filtering & Search**
- **Watermarked Previews**
- **Google Ads Integration** (Vignette, Side Rail, Anchor ads)
- **Inline Advertisement Cards** in product grids

### Backend
- **Node.js + Express** REST API
- **PostgreSQL** database with Prisma ORM
- **JWT Authentication** with refresh tokens
- **Pluggable Object Storage** (MinIO / AWS S3 / Cloudflare R2)
- **Razorpay** payment integration
- **Role-based Access Control** (User/Admin)
- **OpenAPI 3.1.0** specification

### Advertisements
- **Custom Ad Management** - Position-based ads (home sidebar, explore, product grid, blog)
- **Google AdSense Integration** 
  - Vignette Ads (full-page on entry)
  - Side Rail Ads (desktop sticky sidebar)
  - Anchor Ads (mobile bottom sticky)
- **Smart Ad Placement** - Excludes checkout/payment pages for better UX
- **Inline Product Ads** - Appears in explore grid after every 6th product

## 📋 Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **Object Storage** (MinIO recommended for local testing)
- **Razorpay Account** (for payments)
- **Google AdSense Account** (optional, for ads)

## 🛠️ Installation

### Docker Quick Start (Recommended)

Use this mode for real-data testing with Postgres + MinIO + backend + frontend:

```bash
npm run docker:up
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001

Stop all services:

```bash
npm run docker:down
```

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd photography-marketplace
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
\`\`\`

**Backend Environment Variables (.env):**

\`\`\`env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/photography_marketplace

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# Storage Provider
STORAGE_PROVIDER=minio # minio | s3 | r2
PREVIEW_BUCKET_NAME=preview-assets
ORIGINAL_BUCKET_NAME=original-assets
STORAGE_SIGNED_URL_EXPIRY=3600

# MinIO (recommended for local testing)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_REGION=us-east-1
MINIO_FORCE_PATH_STYLE=true
PREVIEW_PUBLIC_BASE_URL=http://localhost:9000/preview-assets
ORIGINAL_PUBLIC_BASE_URL=http://localhost:9000/original-assets

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Google AdSense
GOOGLE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
\`\`\`

**Setup Database:**

\`\`\`bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (creates only admin user)
npm run prisma:seed
\`\`\`

**Default User After Seeding:**
- **Admin:** admin@gmail.com / admin123

**Start Backend Server:**

\`\`\`bash
npm run dev
\`\`\`

Backend will run on http://localhost:5000

### 3. Frontend Setup

\`\`\`bash
# From root directory
cd ..

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
\`\`\`

**Frontend Environment Variables (.env):**

\`\`\`env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
\`\`\`

**Start Frontend:**

\`\`\`bash
npm run dev
\`\`\`

Frontend will run on http://localhost:5173

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User** - User accounts with role-based access
- **Product** - Digital products with multiple resolutions
- **Category** - Product categories
- **Order** - Customer orders with Razorpay integration
- **OrderItem** - Individual items in orders
- **CartItem** - Shopping cart items
- **Advertisement** - Custom ad placements
- **GoogleAdSettings** - Google AdSense configuration
- **Blog** - Blog posts
- **RefreshToken** - JWT refresh tokens

## 🔐 Authentication

The application uses JWT-based authentication:

1. **Access Token** - Short-lived (1 hour), sent in Authorization header
2. **Refresh Token** - Long-lived (7 days), used to obtain new access tokens

**API Flow:**
- Login → Receive access + refresh tokens
- Store tokens in localStorage
- Access token auto-refreshes on 401 errors
- Logout → Invalidates refresh token

## 💳 Payment Integration

Uses **Razorpay** for payment processing:

1. User adds items to cart
2. Checkout creates Razorpay order
3. Frontend opens Razorpay checkout
4. After payment, verify signature on backend
5. Order marked as completed
6. Download links generated for purchased items

## 📦 Storage Integration

Media files are stored via an abstraction layer:
- `STORAGE_PROVIDER=minio` for local/self-hosted MinIO
- `STORAGE_PROVIDER=s3` for AWS S3
- `STORAGE_PROVIDER=r2` for Cloudflare R2

- **Product Images** - Watermarked previews (public)
- **Original Files** - Full resolution files (private, signed URLs)
- **Categories/Blogs/Ads** - Images for various content

**Folder Structure:**
\`\`\`
<preview_bucket> and <original_bucket> buckets/containers
├── product/          # Product images
├── watermarked/      # Watermarked previews
├── category/         # Category images
├── blog/             # Blog images
├── advertisement/    # Ad images
└── misc/            # Other uploads
\`\`\`

## 📢 Advertisement System

### Custom Advertisements

Admins can create position-based ads:

**Positions:**
- `home-sidebar` - Rotating sidebar on homepage (3 ads, 5s rotation)
- `explore` - Explore page ads
- `blog` - Blog page ads
- `product-grid` - Inline ads in product grid

**Grid Index:** For `product-grid` ads, specify after which product (e.g., 6 = after 6th product)

**Priority:** Higher priority ads show first in rotation

### Google AdSense

Three types of Google Ads are supported:

**1. Vignette Ads** (Full-page interstitial)
- Shows on page entry
- Configurable pages (default: homepage)

**2. Side Rail Ads** (Desktop sticky sidebar)
- 160x600 vertical ad
- Shows on desktop (xl breakpoint)
- Configurable pages (default: home, explore, blog)

**3. Anchor Ads** (Mobile bottom sticky)
- Horizontal banner at bottom
- Shows on mobile/tablet
- Configurable pages (default: home, explore, product, blog)

**Excluded Pages:**
By default, no ads on:
- `/checkout`
- `/cart`
- `/payment`

**Admin Configuration:**
Manage Google Ad settings via Admin Panel → Advertisements → Google Ads Settings

## 🎨 User Psychology & Ad Placement

Strategic ad placement based on user psychology:

### ✅ Good Placement (Implemented)
- **Homepage Sidebar** - Non-intrusive, rotates content
- **Explore Page** - Users browsing, more receptive to ads
- **Product Grid Inline** - Natural flow, after 6 products
- **Blog Pages** - Users consuming content
- **Side Rail (Desktop)** - Peripheral vision, doesn't block content
- **Anchor (Mobile)** - Bottom placement, easy to dismiss

### ❌ Excluded Placement (By Design)
- **Checkout/Payment Pages** - Critical conversion points
- **Cart Page** - Decision-making zone
- **Login/Register** - Authentication flows
- **Product Detail** - Focused product view (debatable)

**Reasoning:**
Ads on checkout/payment pages create friction and hurt conversion rates. Research shows 20-30% drop in completion rates with ads on these pages.

## 📱 API Documentation

Full OpenAPI 3.1.0 specification available at `/openapi.yaml`

**Key Endpoints:**

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Products
- `GET /api/v1/products` - Get all products (with filters)
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (admin)
- `PUT /api/v1/products/:id` - Update product (admin)
- `DELETE /api/v1/products/:id` - Delete product (admin)

### Cart
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart` - Add item to cart
- `DELETE /api/v1/cart/items/:productId/:resolution` - Remove item
- `DELETE /api/v1/cart` - Clear cart

### Orders
- `GET /api/v1/orders` - Get user orders
- `POST /api/v1/orders` - Create order
- `POST /api/v1/orders/:id/verify-payment` - Verify Razorpay payment
- `POST /api/v1/orders/generate-link` - Generate download link

### Advertisements
- `GET /api/v1/advertisements` - Get ads (public)
- `POST /api/v1/admin/advertisements` - Create ad (admin)
- `PUT /api/v1/admin/advertisements/:id` - Update ad (admin)
- `DELETE /api/v1/admin/advertisements/:id` - Delete ad (admin)
- `GET /api/v1/advertisements/google-ads/settings` - Get Google Ad settings
- `PUT /api/v1/admin/advertisements/google-ads/settings` - Update settings (admin)

## 🔒 Security

- **JWT Authentication** with HTTP-only cookies option
- **Password Hashing** with bcrypt (12 rounds)
- **CORS** protection
- **Rate Limiting** (can be added with express-rate-limit)
- **Input Validation** with express-validator
- **SQL Injection Protection** via Prisma
- **XSS Protection** via React's default escaping

## 🚢 Deployment

### Backend Deployment (e.g., Railway, Render, AWS)

1. Set environment variables
2. Run migrations: `npm run prisma:migrate`
3. Build: Not needed for Node.js
4. Start: `npm start`

### Frontend Deployment (e.g., Vercel, Netlify)

1. Set environment variables
2. Build: `npm run build`
3. Deploy `dist` folder

### Database (PostgreSQL)

Use managed services:
- **Supabase** (Free tier available)
- **Railway** (Free tier available)
- **AWS RDS**
- **Digital Ocean**

### S3 Alternative

For development/testing without AWS:
- Use **local storage** (modify backend)
- **MinIO** (self-hosted S3-compatible)
- **Cloudinary** (image hosting)

## 📊 Admin Panel Features

Access at `/admin` (requires admin role)

- **Dashboard** - Revenue, orders, users stats
- **Products Management** - CRUD operations, upload images
- **Categories** - Manage product categories
- **Orders** - View all orders, filter by status
- **Users** - View/edit/delete users
- **Blogs** - Create/edit blog posts
- **Advertisements** - Manage custom ads and Google Ads settings

## 🧪 Testing

**Test Credentials:**
- Admin: admin@gmail.com / admin123

**Test Razorpay (Test Mode):**
- Card: 4111 1111 1111 1111
- Any future date, any CVV

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙋 Support

For issues and questions:
- Open GitHub issue
- Email: support@photomarket.com

## 🛣️ Roadmap

- [ ] Email notifications (order confirmation, download links)
- [ ] Advanced search with Elasticsearch
- [ ] Image watermarking service (automatic)
- [ ] Multiple payment gateways (Stripe, PayPal)
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Social media integration
- [ ] Mobile apps (React Native)
- [ ] Analytics dashboard
- [ ] Referral program

---

**Built with ❤️ using React, Node.js, PostgreSQL, and MinIO**
