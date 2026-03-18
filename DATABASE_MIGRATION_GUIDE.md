# 🗄️ Database Migration Guide

## Overview

This guide will help you migrate your existing Photography Marketplace database to support the new features including Services, Contact Inquiries, Site Configuration, and enhanced Product model with three quality levels.

---

## ⚠️ Important Notes

**Before You Begin:**
- ✅ Backup your database first!
- ✅ Stop your backend server
- ✅ Ensure you have PostgreSQL running
- ✅ Review changes in `/backend/prisma/schema.prisma`

**What Will Change:**
- New tables: `Service`, `ContactInquiry`, `SiteConfig`
- Updated table: `Product` (new fields for three quality levels)
- Existing data will be preserved
- New fields will have default/empty values

---

## 📋 Step-by-Step Migration

### Step 1: Backup Your Database

**Option A: Using pg_dump (Recommended)**
```bash
# Create backup
pg_dump -U postgres -d photomarket > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup was created
ls -lh backup_*.sql
```

**Option B: Using Prisma**
```bash
cd backend

# Export data (if you have this setup)
npx prisma db pull
```

### Step 2: Review Schema Changes

**Check what will change:**
```bash
cd backend

# See proposed changes without applying
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script
```

**Expected Changes:**

1. **New Tables:**
   - `Service` - Photography services
   - `ContactInquiry` - Contact form submissions
   - `SiteConfig` - Site-wide configuration

2. **Product Table Modifications:**
   - Remove: `previewImage` (single)
   - Remove: `bundleImages` (array)
   - Remove: `originalFiles` (array)
   - Add: `previewImageHD`, `previewImageFullHD`, `previewImage4K`
   - Add: `bundlePreviewsHD`, `bundlePreviewsFullHD`, `bundlePreviews4K`
   - Add: `originalFileHD`, `originalFileFullHD`, `originalFile4K`
   - Add: `bundleOriginalsHD`, `bundleOriginalsFullHD`, `bundleOriginals4K`

### Step 3: Generate Prisma Client

```bash
cd backend

# Generate new Prisma client with updated schema
npm run prisma:generate

# You should see:
# ✔ Generated Prisma Client
```

### Step 4: Create Migration

```bash
# Create migration with descriptive name
npx prisma migrate dev --name add_services_and_quality_levels

# When prompted:
# ✔ Enter a name for the new migration: add_services_and_quality_levels
```

**This will:**
- Create migration SQL file
- Apply migration to database
- Regenerate Prisma client

**Expected Output:**
```
Applying migration `20260318_add_services_and_quality_levels`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260318_add_services_and_quality_levels/
    └─ migration.sql

✔ Generated Prisma Client
```

### Step 5: Verify Migration

**Check tables exist:**
```bash
psql -U postgres -d photomarket

# In PostgreSQL prompt:
\dt

# You should see:
# Service
# ContactInquiry
# SiteConfig
# Product (updated)

\q
```

**Check Product columns:**
```sql
psql -U postgres -d photomarket

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Product';

\q
```

### Step 6: Handle Existing Products

**If you have existing products with old schema:**

Create migration script: `/backend/prisma/migrate-products.js`

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProducts() {
  console.log('🔄 Migrating existing products...');

  const products = await prisma.product.findMany();

  console.log(`Found ${products.length} products to migrate`);

  for (const product of products) {
    try {
      // Map old single preview image to all three quality levels
      const updateData = {
        previewImageHD: product.previewImage || '',
        previewImageFullHD: product.previewImage || '',
        previewImage4K: product.previewImage || '',

        // Map old original files to all three quality levels
        originalFileHD: product.originalFiles?.[0] || '',
        originalFileFullHD: product.originalFiles?.[0] || '',
        originalFile4K: product.originalFiles?.[0] || '',
      };

      // If product is a bundle, migrate bundle images
      if (product.type === 'BUNDLE' && product.bundleImages?.length > 0) {
        updateData.bundlePreviewsHD = product.bundleImages;
        updateData.bundlePreviewsFullHD = product.bundleImages;
        updateData.bundlePreviews4K = product.bundleImages;

        if (product.originalFiles?.length > 0) {
          updateData.bundleOriginalsHD = product.originalFiles;
          updateData.bundleOriginalsFullHD = product.originalFiles;
          updateData.bundleOriginals4K = product.originalFiles;
        }
      }

      await prisma.product.update({
        where: { id: product.id },
        data: updateData,
      });

      console.log(`✅ Migrated product: ${product.title}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${product.title}:`, error.message);
    }
  }

  console.log('🎉 Migration complete!');
}

migrateProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run migration:**
```bash
cd backend
node prisma/migrate-products.js
```

### Step 7: Seed Default Data

**Create default site configuration:**

File: `/backend/prisma/seed-config.js`

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedConfig() {
  console.log('🌱 Seeding default configuration...');

  // Create site config
  const config = await prisma.siteConfig.upsert({
    where: { id: 'default' }, // We use a known ID
    update: {},
    create: {
      phoneNumber: '+91 98765 43210',
      email: 'info@photomarket.com',
      address: null,
      signedUrlDuration: 3600, // 1 hour
      watermarkText: 'PHOTOMARKET',
      watermarkOpacity: 30,
      previewQuality: 60,
      allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
      maxFileSize: 52428800, // 50MB
    },
  });

  console.log('✅ Site config created:', config.id);

  // Create default services (Indian photography market)
  const services = [
    {
      title: 'Wedding Photography',
      description: 'Complete wedding coverage with candid moments, traditional shots, and edited albums',
      icon: 'heart',
      price: 'Starting from ₹50,000',
      features: [
        'Full day coverage',
        '500+ edited photos',
        'Premium album design',
        '2 professional photographers',
        'Drone shots included',
      ],
      status: 'ACTIVE',
      order: 1,
    },
    {
      title: 'Pre-Wedding Shoot',
      description: 'Romantic outdoor shoots at picturesque locations with creative themes',
      icon: 'camera',
      price: 'Starting from ₹25,000',
      features: [
        '4-6 hour session',
        'Location scouting',
        '100+ edited photos',
        'Outfit changes',
        'Props and styling assistance',
      ],
      status: 'ACTIVE',
      order: 2,
    },
    {
      title: 'Event Photography',
      description: 'Corporate events, parties, birthdays, and special occasions coverage',
      icon: 'users',
      price: 'Starting from ₹15,000',
      features: [
        'Event coverage',
        'Candid photography',
        'Group photos',
        'Same-day highlights',
        'Digital delivery',
      ],
      status: 'ACTIVE',
      order: 3,
    },
    {
      title: 'Product Photography',
      description: 'Professional product photos for e-commerce, catalogs, and marketing',
      icon: 'package',
      price: 'Starting from ₹500/product',
      features: [
        'Multiple angles',
        'White background',
        'Edited and retouched',
        '24-hour delivery',
        'Lifestyle shots available',
      ],
      status: 'ACTIVE',
      order: 4,
    },
    {
      title: 'Real Estate Photography',
      description: 'Property photography with wide-angle shots and drone coverage',
      icon: 'building',
      price: 'Starting from ₹8,000',
      features: [
        'Interior and exterior shots',
        'Drone photography',
        'HDR images',
        'Virtual tour creation',
        'Fast turnaround',
      ],
      status: 'ACTIVE',
      order: 5,
    },
    {
      title: 'Fashion & Portfolio',
      description: 'Professional fashion shoots and portfolio creation for models and actors',
      icon: 'palette',
      price: 'Starting from ₹12,000',
      features: [
        'Studio or outdoor',
        'Professional lighting',
        '50+ edited photos',
        'Styling consultation',
        'Portfolio design',
      ],
      status: 'ACTIVE',
      order: 6,
    },
  ];

  for (const serviceData of services) {
    const service = await prisma.service.create({
      data: serviceData,
    });
    console.log(`✅ Created service: ${service.title}`);
  }

  console.log('🎉 Seeding complete!');
}

seedConfig()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run seed:**
```bash
cd backend
node prisma/seed-config.js
```

### Step 8: Verify Everything Works

**Test database connection:**
```bash
cd backend

# Check Prisma can connect
npx prisma db pull

# Should show: Introspecting database...
```

**Test queries:**
```javascript
// test-db.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  // Test Services
  const services = await prisma.service.findMany();
  console.log(`✅ Services: ${services.length}`);

  // Test SiteConfig
  const config = await prisma.siteConfig.findFirst();
  console.log(`✅ Site config: ${config ? 'Found' : 'Not found'}`);

  // Test Products
  const products = await prisma.product.findMany({ take: 5 });
  console.log(`✅ Products: ${products.length}`);
  if (products.length > 0) {
    console.log('Sample product fields:', {
      previewImageHD: products[0].previewImageHD,
      originalFileHD: products[0].originalFileHD,
    });
  }

  // Test ContactInquiry table exists
  const inquiries = await prisma.contactInquiry.findMany();
  console.log(`✅ Contact Inquiries: ${inquiries.length}`);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `node test-db.js`

### Step 9: Start Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server is running on port 5000
📍 Environment: development
✅ Database connected successfully
```

### Step 10: Test Endpoints

```bash
# Test Services endpoint
curl http://localhost:5000/api/v1/services

# Should return array of services

# Test Site Config endpoint
curl http://localhost:5000/api/v1/site-config

# Should return phone and email

# Test Contact endpoint (POST)
curl -X POST http://localhost:5000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test",
    "inquiryType": "general"
  }'

# Should return success message
```

---

## 🔄 Rollback Instructions

**If something goes wrong:**

### Option 1: Rollback Migration

```bash
cd backend

# Undo last migration
npx prisma migrate resolve --rolled-back <migration_name>

# Restore from backup
psql -U postgres -d photomarket < backup_YYYYMMDD_HHMMSS.sql
```

### Option 2: Full Database Restore

```bash
# Drop database
psql -U postgres -c "DROP DATABASE photomarket;"

# Create new database
psql -U postgres -c "CREATE DATABASE photomarket;"

# Restore from backup
psql -U postgres -d photomarket < backup_YYYYMMDD_HHMMSS.sql
```

---

## 🐛 Troubleshooting

### Migration Fails

**Error: "Column already exists"**

```bash
# Reset Prisma migrations
npx prisma migrate reset

# Warning: This will delete all data!
# Only use if database is empty or you have backup

# Then re-run migration
npx prisma migrate dev
```

**Error: "Cannot connect to database"**

```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Try connecting manually
psql -U postgres -d photomarket
```

### Prisma Client Errors

**Error: "Prisma Client not generated"**

```bash
cd backend
npm run prisma:generate
```

**Error: "Cannot find module '@prisma/client'"**

```bash
cd backend
npm install @prisma/client
npm run prisma:generate
```

### Schema Drift Detected

**Error: "Your Prisma schema differs from your database"**

```bash
# Option 1: Update database to match schema
npx prisma db push

# Option 2: Update schema to match database
npx prisma db pull
```

---

## 📊 Migration Checklist

Use this checklist to track your progress:

**Pre-Migration:**
- [ ] Database backed up
- [ ] Backend server stopped
- [ ] PostgreSQL running
- [ ] Reviewed schema changes

**Migration:**
- [ ] Generated Prisma client
- [ ] Created migration
- [ ] Applied migration
- [ ] Verified tables created
- [ ] Migrated existing products (if any)
- [ ] Seeded default configuration
- [ ] Seeded default services

**Post-Migration:**
- [ ] Tested database connection
- [ ] Tested API endpoints
- [ ] Started backend server
- [ ] Tested frontend integration
- [ ] Verified admin panel access
- [ ] Checked data integrity

**Cleanup:**
- [ ] Removed migration scripts (if one-time use)
- [ ] Updated documentation
- [ ] Informed team members
- [ ] Monitored for issues

---

## 📝 Migration SQL Reference

**For manual migration (if needed):**

```sql
-- Create Service table
CREATE TABLE "Service" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "price" TEXT,
  "features" TEXT[],
  "image" TEXT,
  "status" "Status" NOT NULL DEFAULT 'ACTIVE',
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create ContactInquiry table
CREATE TABLE "ContactInquiry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "inquiryType" TEXT NOT NULL,
  "serviceId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create SiteConfig table
CREATE TABLE "SiteConfig" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "phoneNumber" TEXT NOT NULL DEFAULT '+91 98765 43210',
  "email" TEXT NOT NULL DEFAULT 'info@photomarket.com',
  "address" TEXT,
  "signedUrlDuration" INTEGER NOT NULL DEFAULT 3600,
  "watermarkText" TEXT NOT NULL DEFAULT 'PHOTOMARKET',
  "watermarkOpacity" INTEGER NOT NULL DEFAULT 30,
  "previewQuality" INTEGER NOT NULL DEFAULT 60,
  "allowedImageFormats" TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'webp']::TEXT[],
  "maxFileSize" INTEGER NOT NULL DEFAULT 52428800,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add indexes
CREATE INDEX "Service_status_order_idx" ON "Service"("status", "order");
CREATE INDEX "ContactInquiry_status_createdAt_idx" ON "ContactInquiry"("status", "createdAt");
CREATE INDEX "ContactInquiry_inquiryType_idx" ON "ContactInquiry"("inquiryType");
```

---

## 🎓 Learning Resources

**Prisma Documentation:**
- [Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Troubleshooting](https://www.prisma.io/docs/guides/troubleshooting)

**PostgreSQL:**
- [Backup & Restore](https://www.postgresql.org/docs/current/backup.html)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)

---

**Migration Date:** March 18, 2026  
**Status:** Ready for execution  
**Estimated Time:** 10-15 minutes  
**Risk Level:** Low (with backup)

**Questions?** Check IMPLEMENTATION_SUMMARY.md or NEW_FEATURES_GUIDE.md for additional help.
