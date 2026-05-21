import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subDays, startOfDay } from 'date-fns';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  const [
    totalProducts,
    lowStockCount,
    outOfStockCount,
    totalCategories,
    totalSuppliers,
    unreadAlerts,
    recentMovements,
    inventoryValue,
    categoryStats,
    movementsByDay,
    topLowStock,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: { gt: 0 }, stockLteMinStock: undefined } as any }),
    prisma.product.count({ where: { isActive: true, stock: 0 } }),
    prisma.category.count(),
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.alert.count({ where: { isRead: false } }),
    prisma.stockMovement.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.product.aggregate({ where: { isActive: true }, _sum: { stock: true }, }),
    prisma.category.findMany({
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { products: { _count: 'desc' } },
      take: 6,
    }),
    prisma.stockMovement.groupBy({
      by: ['type', 'createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { quantity: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: [{ stock: 'asc' }],
      take: 5,
      select: { id: true, name: true, sku: true, stock: true, minStock: true },
    }),
  ]);

  // Calculate total inventory value separately
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { stock: true, cost: true },
  });
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * Number(p.cost)), 0);

  // Low stock count (stock <= minStock and stock > 0)
  const lowStock = await prisma.product.count({
    where: { isActive: true, stock: { gt: 0 }, AND: [{ stock: { lte: 20 } }] },
  });

  return NextResponse.json({
    data: {
      totalProducts,
      lowStockCount: lowStock,
      outOfStockCount,
      totalCategories,
      totalSuppliers,
      unreadAlerts,
      recentMovements,
      totalInventoryValue,
      categoryStats: categoryStats.map((c) => ({
        name: c.name,
        count: c._count.products,
        color: c.color || '#3B82F6',
      })),
      topLowStock,
    },
  });
}
