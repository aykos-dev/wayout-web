import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Providers } from './providers';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getLangFromCookies } from '@/lib/i18n-server';
import { getDict } from '@/lib/i18n';
import { FirebaseAnalytics } from '@/components/analytics/firebase-analytics';
import { Suspense } from 'react';
import {
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Outway — Nature routes across Uzbekistan',
    template: `%s · ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  keywords: [
    'Uzbekistan tours',
    'hiking Uzbekistan',
    'nature trips',
    'Chimgan',
    'trekking',
    'day trips',
    'weekend getaways',
  ],
  alternates: { canonical: '/' },
  description:
    "Curated nature tours from the region\u2019s best local guides. Multi-day treks, day trips, weekend getaways.",
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: 'uz_UZ',
    alternateLocale: ['en_US', 'ru_RU'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
      <head>
        {/* Telegram Mini App SDK — exposes window.Telegram.WebApp when the
            site is opened inside the bot. No-op in a regular browser. */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <Providers>
          <Suspense fallback={null}>
            <FirebaseAnalytics lang={lang} />
          </Suspense>
          <SiteHeader lang={lang} dict={dict} />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <SiteFooter dict={dict} />
        </Providers>
      </body>
    </html>
  );
}
