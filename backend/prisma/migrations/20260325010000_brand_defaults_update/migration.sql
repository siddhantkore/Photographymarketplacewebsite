-- Update default brand-facing SiteConfig values
ALTER TABLE "SiteConfig"
ALTER COLUMN "email" SET DEFAULT 'info@likephotostudio.com',
ALTER COLUMN "watermarkText" SET DEFAULT 'LIKE PHOTO STUDIO';
