import { Metadata } from 'next'
import "./landing.css";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/landing/hero-section";
import LoyaltySection from "@/components/landing/loyalty-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import OwnerSection from "@/components/landing/owner-section";
import CtaSection from "@/components/landing/cta-section";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: 'Otoparkçım - İstanbul, Ankara, İzmir Otopark Bul | Ucuz Otopark Arama',
  description: 'Türkiye\'nin en kapsamlı otopark arama platformu. İstanbul, Ankara, İzmir\'de uygun fiyatlı otopark bul, fiyatları karşılaştır, online rezervasyon yap. 7/24 vale hizmeti.',
  keywords: 'istanbul otopark, otopark bul, ucuz otopark, otopark fiyatları, ankara otopark, izmir otopark, vale hizmeti, otopark rezervasyon, kadıköy otopark, beşiktaş otopark',
  openGraph: {
    title: 'Otoparkçım - Türkiye\'nin Otopark Arama Platformu',
    description: 'İstanbul, Ankara, İzmir\'de en uygun otoparkları bul ve rezervasyon yap',
    url: 'https://www.otoparkcim.net',
    siteName: 'Otoparkçım',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otoparkçım - Otopark Bul',
    description: 'En uygun otoparkları bul ve rezervasyon yap',
  },
  alternates: {
    canonical: 'https://www.otoparkcim.net',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function HomePage() {
  // Schema.org yapısal veri
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Otoparkçım",
    "url": "https://www.otoparkcim.net",
    "description": "Türkiye'nin en kapsamlı otopark arama platformu",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.otoparkcim.net/otopark/{search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <div className="landing-root">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <Navbar />
      <HeroSection />
      <LoyaltySection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <OwnerSection />
      <CtaSection />
      {/* SEO için şehir linkleri */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Popüler Şehirler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            <a href="/otopark/istanbul" className="text-center p-4 bg-white rounded-lg hover:shadow-md transition">
              <div className="text-xl font-semibold">İstanbul</div>
              <div className="text-sm text-gray-600">Otopark Bul</div>
            </a>
            <a href="/otopark/ankara" className="text-center p-4 bg-white rounded-lg hover:shadow-md transition">
              <div className="text-xl font-semibold">Ankara</div>
              <div className="text-sm text-gray-600">Otopark Bul</div>
            </a>
            <a href="/otopark/izmir" className="text-center p-4 bg-white rounded-lg hover:shadow-md transition">
              <div className="text-xl font-semibold">İzmir</div>
              <div className="text-sm text-gray-600">Otopark Bul</div>
            </a>
            <a href="/otopark/bursa" className="text-center p-4 bg-white rounded-lg hover:shadow-md transition">
              <div className="text-xl font-semibold">Bursa</div>
              <div className="text-sm text-gray-600">Otopark Bul</div>
            </a>
            <a href="/otopark/antalya" className="text-center p-4 bg-white rounded-lg hover:shadow-md transition">
              <div className="text-xl font-semibold">Antalya</div>
              <div className="text-sm text-gray-600">Otopark Bul</div>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}