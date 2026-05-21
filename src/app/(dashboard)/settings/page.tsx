'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { User, Moon, Sun, Shield, Bell, Loader2, Check } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(session?.user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const cardClass = "card p-6 space-y-4";
  const sectionTitle = "text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Profile */}
      <div className={cardClass}>
        <h3 className={sectionTitle}><User className="w-4 h-4" />Profile</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input value={session?.user?.email || ''} disabled className="input-base opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <input value={(session?.user as any)?.role || 'STAFF'} disabled className="input-base opacity-60 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>{theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}Appearance</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`p-3 border-2 rounded-xl text-sm font-medium capitalize transition-all ${
                theme === t
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
            </button>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className={cardClass}>
        <h3 className={sectionTitle}><Shield className="w-4 h-4" />Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</p>
              <p className="text-xs text-slate-500">Change your account password</p>
            </div>
            <button className="btn-secondary text-xs px-3 py-1.5">Change</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Two-Factor Auth</p>
              <p className="text-xs text-slate-500">Add an extra layer of security</p>
            </div>
            <button className="btn-secondary text-xs px-3 py-1.5 opacity-50 cursor-not-allowed">Coming soon</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={cardClass}>
        <h3 className={sectionTitle}><Bell className="w-4 h-4" />Notifications</h3>
        <div className="space-y-3">
          {[
            { label: 'Low stock alerts', desc: 'Get notified when products are running low', enabled: true },
            { label: 'Out of stock alerts', desc: 'Get notified when products are out of stock', enabled: true },
            { label: 'Email notifications', desc: 'Receive alerts via email', enabled: !!process.env.NEXT_PUBLIC_EMAIL_ENABLED },
            { label: 'WhatsApp notifications', desc: 'Receive alerts via WhatsApp', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${item.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} relative cursor-pointer`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
