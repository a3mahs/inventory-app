import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { SocketProvider } from '@/components/providers/SocketProvider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'InventoryPro',
    template: '%s | InventoryPro',
  },
  description: 'Professional inventory management system with real-time tracking and AI insights',
  keywords: ['inventory', 'management', 'stock', 'products', 'warehouse'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
