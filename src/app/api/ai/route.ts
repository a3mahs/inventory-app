import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatWithInventoryAI } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured. Please set ANTHROPIC_API_KEY.' }, { status: 503 });
  }

  try {
    const { messages } = await req.json();

    // Build inventory context
    const [totalProducts, lowStock, outOfStock, totalCategories, totalSuppliers, recentAlerts] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { isActive: true, stock: 0 } }),
      prisma.category.count(),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.alert.findMany({ where: { isRead: false }, take: 5, orderBy: { createdAt: 'desc' } }),
    ]);

    const inventoryContext = `
Inventory Summary:
- Total Active Products: ${totalProducts}
- Low Stock Items: ${lowStock}
- Out of Stock Items: ${outOfStock}
- Categories: ${totalCategories}
- Active Suppliers: ${totalSuppliers}
- Unread Alerts: ${recentAlerts.length}
${recentAlerts.length > 0 ? `\nRecent Alerts:\n${recentAlerts.map((a) => `- ${a.title}: ${a.message}`).join('\n')}` : ''}
    `.trim();

    const response = await chatWithInventoryAI(messages, inventoryContext);
    return NextResponse.json({ data: { response } });
  } catch (error) {
    logger.error(error, 'AI route error');
    return NextResponse.json({ error: 'AI service error' }, { status: 500 });
  }
}
