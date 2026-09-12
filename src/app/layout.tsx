import type { Metadata } from 'next';
import { Instrument_Sans, Bitter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const bitter = Bitter({
  subsets: ['latin'],
  variable: '--font-bitter',
  display: 'swap',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'BBB — Boring Business Bureau',
  description: 'Acquisition sourcing for overlooked, cash-flowing local businesses',
  icons: {
    icon: '/bbbicon.png',
    apple: '/bbbicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${bitter.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
