import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { phone, message } = await req.json();

  if (!phone || !message) {
    return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 });
  }

  const sent = await sendWhatsAppMessage(phone, message);
  if (!sent) {
    return NextResponse.json({ error: 'WhatsApp not connected or send failed' }, { status: 503 });
  }

  return NextResponse.json({ message: 'Message sent successfully' });
}
