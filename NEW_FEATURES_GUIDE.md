# 🚀 New Features Quick Start Guide

## Table of Contents
1. [Services Management](#services-management)
2. [Contact Inquiries](#contact-inquiries)
3. [Site Configuration](#site-configuration)
4. [Image Processing Setup](#image-processing-setup)

---

## 1. Services Management

### Adding a New Service

1. **Navigate to Admin Panel**
   ```
   URL: http://localhost:5173/admin/services
   ```

2. **Click "Add Service" Button**

3. **Fill in Service Details:**
   - **Title**: e.g., "Wedding Photography"
   - **Description**: Detailed service description
   - **Icon**: Choose from dropdown (camera, heart, users, etc.)
   - **Price**: e.g., "Starting from ₹50,000" or leave empty for "Custom Quote"
   - **Features**: Click "Add Feature" to add multiple features
     - Professional photographer
     - Full day coverage
     - 500+ edited photos
     - etc.
   - **Image URL**: Optional service image
   - **Status**: Active or Inactive
   - **Order**: Number for custom ordering (lower numbers appear first)

4. **Click "Create Service"**

### Editing a Service

1. Click the **Edit** icon (pencil) next to any service
2. Modify fields as needed
3. Click "Update Service"

### Reordering Services

- Set the "Order" field to control display sequence
- Lower numbers appear first
- e.g., Order 1 shows before Order 2

### Deleting a Service

1. Click the **Trash** icon next to the service
2. Confirm deletion

---

## 2. Contact Inquiries

### Viewing Inquiries

1. **Navigate to Inquiries Page**
   ```
   URL: http://localhost:5173/admin/inquiries
   ```

2. **Filter by Status:**
   - All Inquiries
   - New (unread)
   - Read
   - Responded
   - Closed

### Managing an Inquiry

1. **Click Eye Icon** to view details
2. **Modal shows:**
   - Name, email, phone
   - Subject and message
   - Inquiry type (service/advertisement/general)
   - Submission date

3. **Actions Available:**
   - **Update Status**: Use dropdown to change status
   - **Reply via Email**: Opens email client with pre-filled subject
   - **Delete**: Remove inquiry (use cautiously)

### Status Workflow

```
NEW → READ → RESPONDED → CLOSED
```

**Best Practices:**
- Mark as READ when you first view it
- Mark as RESPONDED after replying
- Mark as CLOSED when issue is resolved

### Getting Email Notifications

Modify `/backend/src/controllers/contactController.js`:

```javascript
// After creating inquiry
await sendEmail({
  to: 'admin@photomarket.com',
  subject: `New ${inquiry.inquiryType} inquiry from ${inquiry.name}`,
  text: inquiry.message,
});
```

---

## 3. Site Configuration

### Updating Contact Information

1. **Navigate to Settings**
   ```
   URL: http://localhost:5173/admin/settings
   ```

2. **Update Contact Section:**
   - Phone Number: Displayed on Services page and footer
   - Email: Used for contact purposes
   - Address: Optional business address

### Configuring Watermark

**Watermark Text:**
- Default: "PHOTOMARKET"
- Can be changed to your business name
- Appears diagonally across preview images

**Watermark Opacity:**
- Range: 0% (invisible) to 100% (fully visible)
- Recommended: 20-40% for visibility without obscuring image
- Too low: Easy to screenshot and use
- Too high: Ruins user experience

**Preview Quality:**
- Range: 30% to 90%
- Default: 60%
- Lower: Smaller file size, lower quality
- Higher: Better quality, larger files
- Recommended: 50-70% for good balance

**Live Preview:**
- Changes reflect immediately in preview box
- Test different settings before saving

### Setting Download Duration

**Signed URL Duration:**
- Measured in seconds
- Default: 3600 (1 hour)
- Recommended ranges:
  - 3600 = 1 hour (safe)
  - 7200 = 2 hours
  - 86400 = 24 hours (max recommended)
  - 300 = 5 minutes (minimum)

**Security Consideration:**
- Shorter duration = More secure
- Longer duration = Better user experience
- Balance based on your needs

### Saving Changes

1. Make your changes
2. Review in preview
3. Click "Save Configuration"
4. Changes apply immediately to new uploads

---

## 4. Image Processing Setup

### Prerequisites

✅ Sharp is already installed (`npm install` includes it)
✅ AWS S3 bucket configured
✅ Environment variables set

### How It Works

**When Admin Uploads Product:**

```
Step 1: Admin uploads 3 images (HD, Full HD, 4K)
   ↓
Step 2: Backend receives images
   ↓
Step 3: For each image:
   - Create watermarked preview (low quality)
   - Keep original (high quality, no watermark)
   ↓
Step 4: Upload to S3
   - Previews: Public bucket (anyone can view)
   - Originals: Private bucket (signed URLs only)
   ↓
Step 5: Store URLs in database
   - previewImageHD, previewImageFullHD, previewImage4K
   - originalFileHD, originalFileFullHD, originalFile4K
```

**When User Views Product:**
- Shows watermarked previews
- Cannot access originals
- Sees pricing for each quality

**When User Purchases:**
```
Step 1: Payment successful
   ↓
Step 2: Backend generates signed URL for purchased quality
   ↓
Step 3: URL valid for configured duration (e.g., 1 hour)
   ↓
Step 4: User downloads original (no watermark)
   ↓
Step 5: URL expires after duration
```

### Testing Image Processing

**1. Create Test Script:**

File: `/backend/test-image-processing.js`

```javascript
import { processUploadedImage } from './src/utils/imageProcessor.js';
import { uploadToS3 } from './src/utils/s3Helper.js';
import fs from 'fs/promises';

async function test() {
  // Read test image
  const imageBuffer = await fs.readFile('./test-image.jpg');

  // Process
  const { preview, original } = await processUploadedImage(imageBuffer, {
    watermark: { text: 'TEST', opacity: 30 },
    previewQuality: 60,
  });

  // Save locally to check
  await fs.writeFile('./preview.jpg', preview);
  await fs.writeFile('./original.jpg', original);

  console.log('✅ Images processed successfully!');
  console.log('Check preview.jpg and original.jpg');
}

test();
```

**2. Run Test:**
```bash
cd backend
node test-image-processing.js
```

**3. Verify:**
- `preview.jpg` should have watermark
- `original.jpg` should be high quality, no watermark

### Watermark Customization

**Change Watermark Settings:**

1. Go to Admin → Settings
2. Update "Watermark Text"
3. Adjust opacity slider
4. Check preview
5. Save

**For Advanced Customization:**

Edit `/backend/src/utils/imageProcessor.js`:

```javascript
// Change watermark size
const fontSize = Math.min(width, height) * 0.08; // 8% of image

// Change rotation
patternTransform="rotate(-45)" // -45 degrees

// Change font
font-family="Arial, sans-serif"
```

---

## 📞 Using the Services Page

### For Site Visitors

1. **Visit Services Page**
   ```
   URL: http://localhost:5173/services
   ```

2. **Browse Services:**
   - See all active photography services
   - View pricing and features
   - Check contact information

3. **Submit Inquiry:**
   - Click "Inquire Now" on any service
   - OR click "Get a Quote" in hero section
   - Fill form:
     - Name, Email, Phone (optional)
     - Subject (auto-filled for specific service)
     - Message
   - Click "Submit Inquiry"

4. **Confirmation:**
   - Success message appears
   - Admin receives inquiry in dashboard
   - User gets confirmation (if email configured)

### Contact Information Display

**Phone Number:**
- Shows in hero section as button
- Clickable (opens phone dialer on mobile)
- Shows in contact section

**Email:**
- Displays in contact section
- Clickable (opens email client)

**Address:**
- Shows if configured
- Useful for physical visits

---

## 🔧 Troubleshooting

### Watermark Not Appearing

**Check:**
1. Site configuration has watermark text set
2. Opacity is > 0%
3. Image processing is being called during upload
4. Check browser console for errors

**Fix:**
```bash
cd backend
npm install sharp --save
```

### Services Not Showing

**Check:**
1. Service status is "ACTIVE"
2. Database has services
3. API endpoint works: `curl http://localhost:5000/api/v1/services`

**Create Test Service:**
```javascript
await fetch('http://localhost:5000/api/v1/services', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    title: 'Test Service',
    description: 'Test description',
    icon: 'camera',
    status: 'ACTIVE',
  }),
});
```

### Inquiries Not Submitting

**Check:**
1. All required fields filled (name, email, subject, message, inquiryType)
2. Backend API is running
3. No CORS errors in console

**Test API Directly:**
```bash
curl -X POST http://localhost:5000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Test message",
    "inquiryType": "general"
  }'
```

### Settings Not Saving

**Check:**
1. Admin is logged in
2. JWT token is valid
3. All values are in valid ranges
4. No errors in browser console

**Verify Config Endpoint:**
```bash
curl http://localhost:5000/api/v1/site-config/full \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Admin Workflow Examples

### Example 1: Wedding Season Promotion

1. **Create Wedding Service:**
   - Title: "Wedding Photography - Special Offer"
   - Price: "₹45,000 (Limited Time)"
   - Features: List all included items
   - Set Order: 1 (appears first)

2. **Monitor Inquiries:**
   - Check /admin/inquiries daily
   - Filter by "service" type
   - Respond promptly via email

3. **Track Success:**
   - See how many inquiries
   - Conversion rate
   - Update service based on feedback

### Example 2: Managing Watermarks

**Scenario: Users complaining watermark too strong**

1. Go to Settings
2. Reduce opacity from 30% to 20%
3. Check preview
4. Save changes
5. New uploads will have lighter watermark

**Scenario: Preventing theft**

1. Increase opacity to 40-50%
2. Reduce preview quality to 50%
3. Tighter security, but may affect user experience

### Example 3: Contact Inquiry Flow

**New inquiry arrives:**

1. **Email notification** (if configured)
   - Subject: "New service inquiry from John Doe"

2. **Check Admin Panel:**
   - See "1 new inquiry" badge
   - Go to /admin/inquiries
   - Click to view details

3. **Respond:**
   - Click "Reply via Email"
   - Send response
   - Update status to "RESPONDED"

4. **Follow-up:**
   - If they book, mark as "CLOSED"
   - If they don't respond, mark as "CLOSED" after timeout

---

## 🎯 Best Practices

### Services

✅ **DO:**
- Use clear, descriptive titles
- Include pricing (even if "From ₹X")
- List 3-5 key features
- Use relevant icons
- Keep active/inactive status updated

❌ **DON'T:**
- Leave price empty unless truly custom
- Use too many services (overwhelming)
- Forget to set proper order

### Watermarks

✅ **DO:**
- Test different opacities
- Use business name
- Balance security vs user experience
- Check on different image types

❌ **DON'T:**
- Make it too strong (ruins UX)
- Make it too weak (easy to steal)
- Change too frequently

### Inquiries

✅ **DO:**
- Respond within 24 hours
- Update status promptly
- Keep professional records
- Delete spam/irrelevant ones

❌ **DON'T:**
- Let inquiries pile up without response
- Delete all inquiries (keep for records)
- Ignore status management

---

## 📈 Success Metrics to Track

1. **Service Inquiries:**
   - Total per month
   - By service type
   - Conversion to bookings

2. **Response Time:**
   - Average time to mark as READ
   - Average time to RESPOND
   - Time to CLOSE

3. **Image Security:**
   - Watermark complaints (adjust if needed)
   - Download success rate
   - Abuse reports

---

**Ready to Start!** 🎉

Follow this guide to make full use of your new features. If you encounter issues, check the troubleshooting section or refer to IMPLEMENTATION_SUMMARY.md for technical details.
