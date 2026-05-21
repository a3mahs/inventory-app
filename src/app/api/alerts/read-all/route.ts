import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcastToInventory } from '@/lib/socket';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.alert.updateMany({ where: { isRead: false }, data: { isRead: true } });
  broadcastToInventory('alert:all-read', null);

  return NextResponse.json({ message: 'All alerts marked as read' });
}
