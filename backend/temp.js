import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const products = await prisma.product.findMany({ select: { categories: true }});
  console.log('Products:', JSON.stringify(products, null, 2));
  const categories = await prisma.category.findMany({ select: { slug: true }});
  console.log('Categories:', JSON.stringify(categories, null, 2));
}
run().finally(() => prisma.$disconnect());
