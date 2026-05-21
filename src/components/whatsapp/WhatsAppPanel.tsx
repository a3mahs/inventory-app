'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Wifi, WifiOff, QrCode, Send, Loader2, RefreshCw } from 'lucide-react';
import { useSocket } from '@/components/providers/SocketProvider';
import Image from 'next/image';

export function WhatsAppPanel() {
  const { socket } = useSocket();
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    // Load current status
    fetch('/api/whatsapp/status')
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.data.status);
        setQrCode(data.data.qr);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('whatsapp:qr', ({ qr }: { qr: string }) => {
      setQrCode(qr);
      setStatus('connecting');
      setIsConnecting(false);
    });

    socket.on('whatsapp:connected', () => {
      setStatus('connected');
      setQrCode(null);
      setIsConnecting(false);
    });

    return () => {
      socket.off('whatsapp:qr');
      socket.off('whatsapp:connected');
    };
  }, [socket]);

  async function handleConnect() {
    setIsConnecting(true);
    setStatus('connecting');
    await fetch('/api/whatsapp/connect', { method: 'POST' });
  }

  async function handleDisconnect() {
    await fetch('/api/whatsapp/connect', { method: 'DELETE' });
    setStatus('disconnected');
    setQrCode(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setIsSending(true);
    setSendResult(null);

    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });

    const data = await res.json();
    setSendResult(res.ok ? 'Message sent!' : data.error || 'Failed to send');
    setIsSending(false);
    if (res.ok) { setPhone(''); setMessage(''); }
  }

  return (
    <div className="space-y-6">
      {/* Connection status */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' :
              status === 'connecting' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-slate-100 dark:bg-slate-800'
            }`}>
              <MessageCircle className={`w-5 h-5 ${
                status === 'connected' ? 'text-green-600' :
                status === 'connecting' ? 'text-yellow-600' : 'text-slate-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">WhatsApp Connection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {status === 'connected' ? 'Connected and ready' :
                 status === 'connecting' ? 'Scan QR code to connect' :
                 'Not connected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-green-500 animate-pulse-slow' :
              status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-400'
            }`} />
            <span className={`text-sm font-medium capitalize ${
              status === 'connected' ? 'text-green-600' :
              status === 'connecting' ? 'text-yellow-600' : 'text-slate-500'
            }`}>{status}</span>
          </div>
        </div>

        {status === 'disconnected' && (
          <button onClick={handleConnect} disabled={isConnecting} className="btn-primary w-full">
            {isConnecting ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting...</> : <><QrCode className="w-4 h-4" />Connect WhatsApp</>}
          </button>
        )}

        {status === 'connecting' && qrCode && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block">
              <img src={qrCode} alt="WhatsApp QR Code" width={200} height={200} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Scan with WhatsApp</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Open WhatsApp → Settings → Linked Devices → Link a Device</p>
            </div>
            <button onClick={() => { setStatus('disconnected'); setQrCode(null); }} className="btn-secondary">
              Cancel
            </button>
          </div>
        )}

        {status === 'connecting' && !qrCode && (
          <div className="flex items-center justify-center gap-2 py-4 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Generating QR code...</span>
          </div>
        )}

        {status === 'connected' && (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 text-green-600 text-sm">
              <Wifi className="w-4 h-4" />
              <span>WhatsApp is connected</span>
            </div>
            <button onClick={handleDisconnect} className="btn-danger text-xs px-3 py-1.5">
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Send message */}
      {status === 'connected' && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Send Message</h3>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                required
                className="input-base"
              />
            </div>
            {sendResult && (
              <p className={`text-sm ${sendResult === 'Message sent!' ? 'text-green-600' : 'text-red-600'}`}>{sendResult}</p>
            )}
            <button type="submit" disabled={isSending} className="btn-primary">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Message
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
