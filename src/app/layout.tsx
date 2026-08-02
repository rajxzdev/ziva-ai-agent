import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeScript } from '@/components/layout/ThemeScript';

export const metadata: Metadata = {
  title: 'Ziva Agent AI — Multi-Agent Router',
  description:
    'A local-first multi-agent workspace. Choose an AI provider and model for every role, using your own API keys. Runs entirely in the browser with no backend.',
  applicationName: 'Ziva Agent AI',
  keywords: ['multi-agent', 'ai router', 'local first', 'no backend', 'workflow'],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef1f8' },
    { media: '(prefers-color-scheme: dark)', color: '#05070f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
