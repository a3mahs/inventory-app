import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcastToInventory } from '@/lib/socket';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  try {
    const alert = await prisma.alert.update({
      where: { id: params.id },
      data: { isRead: body.isRead ?? true },
    });
    broadcastToInventory('alert:marked-read', params.id);
    return NextResponse.json({ data: alert });
  } catch {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.alert.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Alert deleted' });
  } catch {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }
}

// Mark all as read
export async function PUT(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.alert.updateMany({ where: { isRead: false }, data: { isRead: true } });
  broadcastToInventory('alert:all-read', null);
  return NextResponse.json({ message: 'All alerts marked as read' });
}
