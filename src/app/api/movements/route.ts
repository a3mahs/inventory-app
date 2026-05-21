import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stockMovementSchema } from '@/lib/validations';
import { broadcastToInventory } from '@/lib/socket';
import { sendEmail, lowStockEmailTemplate } from '@/lib/email';
import { sendLowStockAlert } from '@/lib/whatsapp';
import logger from '@/lib/logger';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const productId = searchParams.get('productId') || undefined;

  const where = productId ? { productId } : {};

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: { product: { select: { name: true, sku: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return NextResponse.json({ data: movements, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = stockMovementSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { productId, type, quantity, reason, reference } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  let newStock = product.stock;
  if (type === 'IN' || type === 'RETURN') newStock += quantity;
  else if (type === 'OUT') newStock -= quantity;
  else if (type === 'ADJUSTMENT') newStock = quantity;

  if (newStock < 0) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId,
        userId: (session.user as any).id,
        type,
        quantity,
        prevStock: product.stock,
        newStock,
        reason,
        reference,
      },
      include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } },
    }),
    prisma.product.update({ where: { id: productId }, data: { stock: newStock } }),
  ]);

  // Check for low stock / out of stock alerts
  if (newStock === 0 || newStock <= product.minStock) {
    const alertType = newStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK';
    const alert = await prisma.alert.create({
      data: {
        type: alertType,
        title: newStock === 0 ? 'Out of Stock' : 'Low Stock Alert',
        message: `${product.name} (${product.sku}) - Current stock: ${newStock} units`,
        productId,
      },
    });

    broadcastToInventory('alert:created', alert);

    // Send email notification
    if (process.env.ALERT_EMAIL) {
      const { subject, html } = lowStockEmailTemplate(product.name, product.sku, newStock, product.minStock);
      sendEmail({ to: process.env.ALERT_EMAIL, subject, html }).catch(console.error);
    }
  }

  broadcastToInventory('stock:adjusted', { productId, newStock, movement });
  logger.info({ productId, type, quantity, newStock }, 'Stock movement recorded');

  return NextResponse.json({ data: movement }, { status: 201 });
}
