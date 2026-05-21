import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { broadcastToInventory } from '@/lib/socket';
import logger from '@/lib/logger';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || undefined;
  const supplierId = searchParams.get('supplierId') || undefined;
  const status = searchParams.get('status') || undefined;

  const where: any = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(supplierId && { supplierId }),
    ...(status === 'low_stock' && { stock: { lte: prisma.product.fields.minStock } }),
    ...(status === 'out_of_stock' && { stock: { equals: 0 } }),
    ...(status === 'active' && { isActive: true }),
    ...(status === 'inactive' && { isActive: false }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, supplier: true, _count: { select: { orderItems: true, movements: true } } },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ data: products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
    if (existing) return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });

    const product = await prisma.product.create({
      data: parsed.data,
      include: { category: true, supplier: true },
    });

    // Create initial stock movement if stock > 0
    if (product.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          userId: (session.user as any).id,
          type: 'IN',
          quantity: product.stock,
          prevStock: 0,
          newStock: product.stock,
          reason: 'Initial stock',
        },
      });
    }

    broadcastToInventory('product:created', product);
    logger.info({ productId: product.id }, 'Product created');

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    logger.error(error, 'Error creating product');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
