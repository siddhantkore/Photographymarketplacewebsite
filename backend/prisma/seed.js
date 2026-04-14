import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

async function upsertUser({ email, name, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      password: hashedPassword,
      isEmailVerified: true,
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role,
      isEmailVerified: true,
    },
  });
}

async function main() {
  if (adminEmail && adminPassword) {
    await upsertUser({
      email: adminEmail,
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    });
    console.log('Admin user created from environment variables.');
  } else {
    console.log('No ADMIN_EMAIL/ADMIN_PASSWORD set — skipping admin seed.');
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
