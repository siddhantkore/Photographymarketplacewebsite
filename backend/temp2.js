import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const count = await prisma.product.count({
      where: {
        categories: {
          has: cat.slug,
        },
      },
    });
    console.log(`Category ${cat.slug}: ${count}`);
  }
}
run().finally(() => prisma.$disconnect());
