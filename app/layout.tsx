import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Otoparkçım - İstanbul Park Yeri Bulucu',
  description: 'İstanbul\'da tüm otoparklarda anlık doluluk durumu, fiyat karşılaştırma ve yol tarifi. Ücretsiz kullan, hemen park yerini bul!',
  keywords: ['otopark', 'istanbul otopark', 'park yeri', 'ispark', 'otopark fiyatları', 'yakın otopark'],
  authors: [{ name: 'Otoparkçım' }],
  creator: 'Otoparkçım',
  verification: {
    google: 'lNqTyP4T6Ge-wYG2-gz_zhfaxJ_HCJR8cuQ4naXdl6w',
  },
  openGraph: {
    // ... geri kalanı aynı
    title: 'Otoparkçım - İstanbul Park Yeri Bulucu',
    description: 'İstanbul\'da 254 otoparkta anlık doluluk durumu, fiyat karşılaştırma ve yol tarifi.',
    url: 'https://otoparkcim.net',
    siteName: 'Otoparkçım',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otoparkçım - İstanbul Park Yeri Bulucu',
    description: 'İstanbul\'da 254 otoparkta anlık doluluk durumu, fiyat karşılaştırma ve yol tarifi.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}