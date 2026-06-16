import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getLangFromCookies } from '@/lib/i18n-server';
import { getDict } from '@/lib/i18n';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Outway — Nature routes across Uzbekistan',
  description:
    "Curated nature tours from the region\u2019s best local guides. Multi-day treks, day trips, weekend getaways.",
  openGraph: {
    type: 'website',
    siteName: 'Outway',
  },
  icons: {
    icon: '/app-icon.png',
    apple: '/app-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getLangFromCookies();
  const dict = getDict(lang);
  return (
    <html lang={lang} className={inter.variable}>
      <body className="font-sans">
        <Providers>
          <SiteHeader lang={lang} dict={dict} />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <SiteFooter dict={dict} />
        </Providers>
      </body>
    </html>
  );
}
