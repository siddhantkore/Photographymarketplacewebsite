import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@photomarket.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@photomarket.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // Create test user
  const userPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log('✅ Test user created');

  // Create categories
  const categories = [
    {
      name: 'Wildlife',
      slug: 'wildlife',
      image: 'https://images.unsplash.com/photo-1678048632153-d961f9c37a48',
    },
    {
      name: 'Nature',
      slug: 'nature',
      image: 'https://images.unsplash.com/photo-1717964134799-a98f497172a5',
    },
    {
      name: 'Wedding',
      slug: 'wedding',
      image: 'https://images.unsplash.com/photo-1664463760672-8dc6d190d720',
    },
    {
      name: 'Architecture',
      slug: 'architecture',
      image: 'https://images.unsplash.com/photo-1692818769925-6b815111c653',
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // Create Google Ad Settings
  await prisma.googleAdSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      adClientId: process.env.GOOGLE_ADSENSE_CLIENT_ID || '',
      enableVignette: false,
      enableSideRail: true,
      enableAnchor: true,
      vignettePlaces: ['/'],
      sideRailPlaces: ['/', '/explore', '/blog'],
      anchorPlaces: ['/', '/explore', '/product', '/blog'],
      excludedPages: ['/checkout', '/cart', '/payment'],
    },
  });
  console.log('✅ Google Ad settings created');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
