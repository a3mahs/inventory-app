import { WhatsAppPanel } from '@/components/whatsapp/WhatsAppPanel';

export const metadata = { title: 'WhatsApp' };

export default function WhatsAppPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">WhatsApp Integration</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Connect WhatsApp to receive stock alerts and send notifications</p>
      </div>
      <WhatsAppPanel />
    </div>
  );
}
