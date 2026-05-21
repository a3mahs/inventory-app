import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const thirtyDaysAgo = startOfDay(subDays(new Date(), 29));

  // Stock movements for last 30 days
  const movements = await prisma.stockMovement.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { type: true, quantity: true, createdAt: true },
  });

  // Build daily chart data
  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
  const movementChart = days.map((day) => {
    const dateStr = format(day, 'MMM dd');
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayMovements = movements.filter((m) => format(m.createdAt, 'yyyy-MM-dd') === dayKey);
    return {
      date: dateStr,
      in: dayMovements.filter((m) => m.type === 'IN' || m.type === 'RETURN').reduce((s, m) => s + m.quantity, 0),
      out: dayMovements.filter((m) => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0),
    };
  });

  // Top products by stock value
  const topProducts = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    select: { name: true, stock: true, price: true, cost: true },
    orderBy: [{ stock: 'desc' }],
    take: 8,
  });

  // Category distribution
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });

  return NextResponse.json({
    data: {
      movementChart,
      topProducts: topProducts.map((p) => ({
        name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
        stock: p.stock,
        value: p.stock * Number(p.cost),
      })),
      categoryDistribution: categories
        .filter((c) => c._count.products > 0)
        .map((c) => ({ name: c.name, value: c._count.products, color: c.color || '#3B82F6' })),
    },
  });
}
