import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ city: string }>
}

// İzin verilen şehirler
const validCities = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya']

// Şehir isimleri (SEO için)
const cityNames: Record<string, string> = {
  istanbul: 'İstanbul',
  ankara: 'Ankara',
  izmir: 'İzmir',
  bursa: 'Bursa',
  antalya: 'Antalya',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: cityParam } = await params
  const city = cityParam.toLowerCase()
  
  if (!validCities.includes(city)) {
    return {}
  }

  const cityName = cityNames[city]

  return {
    title: `${cityName} Otopark - Uygun Fiyatlı Otopark Bul | Otoparkçım`,
    description: `${cityName}'da en uygun otopark fiyatlarını karşılaştır, online rezervasyon yap. Açık otopark, kapalı otopark ve vale hizmeti seçenekleri.`,
    keywords: `${city} otopark, ${city} otopark fiyatları, ${city} ucuz otopark, ${city} otopark bul, ${city} vale hizmeti`,
    openGraph: {
      title: `${cityName} Otopark | Otoparkçım`,
      description: `${cityName}'da en uygun otoparkları bul ve rezervasyon yap`,
      url: `https://www.otoparkcim.net/otopark/${city}`,
    },
    alternates: {
      canonical: `https://www.otoparkcim.net/otopark/${city}`,
    },
  }
}

export default async function CityPage({ params }: Props) {
  const { city: cityParam } = await params
  const city = cityParam.toLowerCase()

  if (!validCities.includes(city)) {
    notFound()
  }

  const cityName = cityNames[city]

  // Schema.org - Local Business için
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Otoparkçım ${cityName}`,
    "description": `${cityName}'da otopark arama ve rezervasyon hizmeti`,
    "url": `https://www.otoparkcim.net/otopark/${city}`,
    "areaServed": {
      "@type": "City",
      "name": cityName
    },
    "priceRange": "₺₺"
  }

  // İstanbul için ilçeler (39 ilçe)
  const districts = city === 'istanbul' ? [
    { slug: 'adalar', name: 'Adalar' },
    { slug: 'arnavutkoy', name: 'Arnavutköy' },
    { slug: 'atasehir', name: 'Ataşehir' },
    { slug: 'avcilar', name: 'Avcılar' },
    { slug: 'bagcilar', name: 'Bağcılar' },
    { slug: 'bahcelievler', name: 'Bahçelievler' },
    { slug: 'bakirkoy', name: 'Bakırköy' },
    { slug: 'basaksehir', name: 'Başakşehir' },
    { slug: 'bayrampasa', name: 'Bayrampaşa' },
    { slug: 'besiktas', name: 'Beşiktaş' },
    { slug: 'beykoz', name: 'Beykoz' },
    { slug: 'beylikduzu', name: 'Beylikdüzü' },
    { slug: 'beyoglu', name: 'Beyoğlu' },
    { slug: 'buyukcekmece', name: 'Büyükçekmece' },
    { slug: 'catalca', name: 'Çatalca' },
    { slug: 'cekmekoy', name: 'Çekmeköy' },
    { slug: 'esenler', name: 'Esenler' },
    { slug: 'esenyurt', name: 'Esenyurt' },
    { slug: 'eyupsultan', name: 'Eyüpsultan' },
    { slug: 'fatih', name: 'Fatih' },
    { slug: 'gaziosmanpasa', name: 'Gaziosmanpaşa' },
    { slug: 'gungoren', name: 'Güngören' },
    { slug: 'kadikoy', name: 'Kadıköy' },
    { slug: 'kagithane', name: 'Kağıthane' },
    { slug: 'kartal', name: 'Kartal' },
    { slug: 'kucukcekmece', name: 'Küçükçekmece' },
    { slug: 'maltepe', name: 'Maltepe' },
    { slug: 'pendik', name: 'Pendik' },
    { slug: 'sancaktepe', name: 'Sancaktepe' },
    { slug: 'sariyer', name: 'Sarıyer' },
    { slug: 'silivri', name: 'Silivri' },
    { slug: 'sisli', name: 'Şişli' },
    { slug: 'sultangazi', name: 'Sultangazi' },
    { slug: 'sultanbeyli', name: 'Sultanbeyli' },
    { slug: 'tuzla', name: 'Tuzla' },
    { slug: 'umraniye', name: 'Ümraniye' },
    { slug: 'uskudar', name: 'Üsküdar' },
    { slug: 'zeytinburnu', name: 'Zeytinburnu' },
    { slug: 'taksim', name: 'Taksim' },
  ] : []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <h1 className="text-4xl font-bold mb-6">
        {cityName} Otopark Arama
      </h1>
      
      <p className="text-lg mb-8">
        {cityName}'da en uygun otopark fiyatlarını karşılaştırın ve online rezervasyon yapın.
      </p>

      <div className="grid gap-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {cityName} Otopark Fiyatları
          </h2>
          <p>
            Otoparkçım ile {cityName}'daki tüm otoparkları karşılaştırabilir, 
            en uygun fiyatlı seçeneği bulabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Otopark Türleri</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Açık Otopark</li>
            <li>Kapalı Otopark</li>
            <li>Vale Hizmeti</li>
            <li>Aylık Abonelik</li>
          </ul>
        </section>

        {/* İstanbul için ilçeler */}
        {city === 'istanbul' && districts.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {cityName} İlçeleri
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {districts.map((district) => (
                <a
                  key={district.slug}
                  href={`/otopark/${city}/${district.slug}`}
                  className="p-3 bg-white border rounded-lg hover:shadow-md transition text-center"
                >
                  <div className="font-semibold">{district.name}</div>
                  <div className="text-sm text-gray-600">Otopark Bul</div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// Static params for build time
export async function generateStaticParams() {
  return validCities.map((city) => ({
    city: city,
  }))
}