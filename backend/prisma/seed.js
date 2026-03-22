import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const userEmail = process.env.USER_EMAIL || 'john.doe@example.com';
const userPassword = process.env.USER_PASSWORD || 'password123';

async function upsertUser({ email, name, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      password: hashedPassword,
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role,
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

  await upsertUser({
    email: userEmail,
    name: 'John Doe',
    password: userPassword,
    role: 'USER',
  });

  console.log('Seed complete.');
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`User: ${userEmail} / ${userPassword}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
