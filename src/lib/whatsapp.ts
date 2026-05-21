import path from 'path';
import fs from 'fs';
import logger from './logger';

let waClient: any = null;
let qrCodeBase64: string | null = null;
let connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

const SESSION_PATH = process.env.WHATSAPP_SESSION_PATH || './whatsapp-session';

export function getWhatsAppStatus() {
  return { status: connectionStatus, hasQR: !!qrCodeBase64, qr: qrCodeBase64 };
}

export async function initWhatsApp(): Promise<void> {
  if (connectionStatus === 'connected' || connectionStatus === 'connecting') return;

  try {
    connectionStatus = 'connecting';
    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');
    const QRCode = await import('qrcode');

    if (!fs.existsSync(SESSION_PATH)) {
      fs.mkdirSync(SESSION_PATH, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCodeBase64 = await QRCode.default.toDataURL(qr);
        logger.info('WhatsApp QR code generated');
        if (typeof global !== 'undefined' && (global as any).io) {
          (global as any).io.to('inventory').emit('whatsapp:qr', { qr: qrCodeBase64 });
        }
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        connectionStatus = 'disconnected';
        waClient = null;
        qrCodeBase64 = null;
        if (shouldReconnect) {
          logger.info('WhatsApp reconnecting...');
          setTimeout(() => initWhatsApp(), 5000);
        }
      }

      if (connection === 'open') {
        connectionStatus = 'connected';
        qrCodeBase64 = null;
        waClient = sock;
        logger.info('WhatsApp connected');
        if (typeof global !== 'undefined' && (global as any).io) {
          (global as any).io.to('inventory').emit('whatsapp:connected');
        }
      }
    });
  } catch (error) {
    connectionStatus = 'disconnected';
    logger.error(error, 'WhatsApp init error');
  }
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!waClient || connectionStatus !== 'connected') {
    logger.warn('WhatsApp not connected');
    return false;
  }
  try {
    const jid = phone.includes('@') ? phone : `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
    await waClient.sendMessage(jid, { text: message });
    logger.info({ phone }, 'WhatsApp message sent');
    return true;
  } catch (error) {
    logger.error(error, 'Failed to send WhatsApp message');
    return false;
  }
}

export async function sendLowStockAlert(phone: string, productName: string, stock: number) {
  const message = `🚨 *Low Stock Alert - InventoryPro*\n\n*Product:* ${productName}\n*Current Stock:* ${stock} units\n\nPlease reorder as soon as possible.`;
  return sendWhatsAppMessage(phone, message);
}

export async function disconnectWhatsApp() {
  if (waClient) {
    await waClient.logout();
    waClient = null;
    connectionStatus = 'disconnected';
    qrCodeBase64 = null;
    // Clean session
    if (fs.existsSync(SESSION_PATH)) {
      fs.rmSync(SESSION_PATH, { recursive: true, force: true });
    }
  }
}
