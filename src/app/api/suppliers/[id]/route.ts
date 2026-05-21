import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { supplierSchema } from '@/lib/validations';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: { products: { select: { id: true, name: true, sku: true, stock: true } }, _count: { select: { products: true } } },
  });

  if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  return NextResponse.json({ data: supplier });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = supplierSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: { ...parsed.data, email: parsed.data.email || null, website: parsed.data.website || null },
    });
    return NextResponse.json({ data: supplier });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.supplier.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ message: 'Supplier deactivated' });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
