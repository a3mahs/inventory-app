import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { broadcastToInventory } from '@/lib/socket';
import logger from '@/lib/logger';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      supplier: true,
      movements: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
      alerts: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ data: product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
      include: { category: true, supplier: true },
    });

    broadcastToInventory('product:updated', product);
    return NextResponse.json({ data: product });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ADMIN' && role !== 'MANAGER') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
    broadcastToInventory('product:deleted', { id: params.id });
    return NextResponse.json({ message: 'Product deactivated' });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
