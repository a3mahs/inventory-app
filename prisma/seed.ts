import { PrismaClient, Role, MovementType, AlertType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@inventory.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: { name: 'Electronics', description: 'Electronic devices and components', color: '#3B82F6', icon: 'cpu' },
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: { name: 'Clothing', description: 'Apparel and accessories', color: '#8B5CF6', icon: 'shirt' },
    }),
    prisma.category.upsert({
      where: { name: 'Food & Beverages' },
      update: {},
      create: { name: 'Food & Beverages', description: 'Food products and drinks', color: '#10B981', icon: 'shopping-bag' },
    }),
    prisma.category.upsert({
      where: { name: 'Office Supplies' },
      update: {},
      create: { name: 'Office Supplies', description: 'Office and stationery products', color: '#F59E0B', icon: 'briefcase' },
    }),
  ]);

  // Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'TechDistributor Inc.',
        email: 'orders@techdist.com',
        phone: '+1-555-0100',
        address: '123 Tech Street, San Francisco, CA',
        contact: 'John Smith',
        website: 'https://techdist.com',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'FashionWholesale Co.',
        email: 'wholesale@fashionco.com',
        phone: '+1-555-0200',
        address: '456 Fashion Ave, New York, NY',
        contact: 'Jane Doe',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Global Foods Ltd.',
        email: 'supply@globalfoods.com',
        phone: '+1-555-0300',
        address: '789 Market St, Chicago, IL',
        contact: 'Bob Johnson',
      },
    }),
  ]);

  // Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Laptop Pro 15"',
        sku: 'TECH-001',
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        price: 1299.99,
        cost: 850.00,
        stock: 45,
        minStock: 10,
        unit: 'unit',
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        tags: ['laptop', 'computer', 'electronics'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Mouse',
        sku: 'TECH-002',
        description: 'Ergonomic wireless mouse with long battery life',
        price: 39.99,
        cost: 18.00,
        stock: 3,
        minStock: 15,
        unit: 'unit',
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        tags: ['mouse', 'peripheral'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub 7-in-1',
        sku: 'TECH-003',
        description: '7-port USB-C hub with HDMI, USB 3.0, SD card reader',
        price: 59.99,
        cost: 25.00,
        stock: 0,
        minStock: 20,
        unit: 'unit',
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Office Chair Ergonomic',
        sku: 'OFFCE-001',
        description: 'Premium ergonomic office chair with lumbar support',
        price: 349.99,
        cost: 180.00,
        stock: 12,
        minStock: 5,
        unit: 'unit',
        categoryId: categories[3].id,
        tags: ['chair', 'furniture', 'ergonomic'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Notebook A4 (Pack of 5)',
        sku: 'OFFCE-002',
        description: 'Pack of 5 ruled notebooks, 200 pages each',
        price: 12.99,
        cost: 5.00,
        stock: 200,
        minStock: 50,
        unit: 'pack',
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Cotton T-Shirt (M)',
        sku: 'CLOTH-001',
        description: '100% organic cotton t-shirt, medium size',
        price: 24.99,
        cost: 8.00,
        stock: 75,
        minStock: 20,
        unit: 'unit',
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
      },
    }),
  ]);

  // Alerts for low/out of stock
  await prisma.alert.createMany({
    data: [
      {
        type: AlertType.LOW_STOCK,
        title: 'Low Stock Alert',
        message: `Wireless Mouse (${products[1].sku}) is running low. Current stock: 3 units (minimum: 15)`,
        productId: products[1].id,
      },
      {
        type: AlertType.OUT_OF_STOCK,
        title: 'Out of Stock Alert',
        message: `USB-C Hub 7-in-1 (${products[2].sku}) is out of stock. Please reorder immediately.`,
        productId: products[2].id,
      },
    ],
  });

  // Stock movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: products[0].id,
        userId: admin.id,
        type: MovementType.IN,
        quantity: 50,
        prevStock: 0,
        newStock: 50,
        reason: 'Initial stock',
      },
      {
        productId: products[0].id,
        userId: admin.id,
        type: MovementType.OUT,
        quantity: 5,
        prevStock: 50,
        newStock: 45,
        reason: 'Sales',
      },
      {
        productId: products[1].id,
        userId: admin.id,
        type: MovementType.IN,
        quantity: 25,
        prevStock: 0,
        newStock: 25,
        reason: 'Initial stock',
      },
      {
        productId: products[1].id,
        userId: admin.id,
        type: MovementType.OUT,
        quantity: 22,
        prevStock: 25,
        newStock: 3,
        reason: 'Sales',
      },
    ],
  });

  console.log('Seed completed!');
  console.log('Admin login: admin@inventory.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
