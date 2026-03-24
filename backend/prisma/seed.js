import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

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
  await upsertUser({
    email: adminEmail,
    name: 'Admin',
    password: adminPassword,
    role: 'ADMIN',
  });

  console.log('Seed complete.');
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
