import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: Promise<{ city: string; district: string }>
}

// İzin verilen şehirler
const validCities = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya']

// Şehir isimleri
const cityNames: Record<string, string> = {
  istanbul: 'İstanbul',
  ankara: 'Ankara',
  izmir: 'İzmir',
  bursa: 'Bursa',
  antalya: 'Antalya',
}

// İstanbul ilçeleri (39 ilçe)
  const istanbulDistricts = [
    'adalar', 'arnavutkoy', 'atasehir', 'avcilar', 'bagcilar',
    'bahcelievler', 'bakirkoy', 'basaksehir', 'bayrampasa', 'besiktas',
    'beykoz', 'beylikduzu', 'beyoglu', 'buyukcekmece', 'catalca',
    'cekmekoy', 'esenler', 'esenyurt', 'eyupsultan', 'fatih',
    'gaziosmanpasa', 'gungoren', 'kadikoy', 'kagithane', 'kartal',
    'kucukcekmece', 'maltepe', 'pendik', 'sancaktepe', 'sariyer',
    'silivri', 'sisli', 'sultangazi', 'sultanbeyli', 'tuzla',
    'umraniye', 'uskudar', 'zeytinburnu', 'taksim'
  ]

// İlçe isimleri (SEO için doğru yazım - 39 ilçe)
const districtNames: Record<string, string> = {
  adalar: 'Adalar',
  arnavutkoy: 'Arnavutköy',
  atasehir: 'Ataşehir',
  avcilar: 'Avcılar',
  bagcilar: 'Bağcılar',
  bahcelievler: 'Bahçelievler',
  bakirkoy: 'Bakırköy',
  basaksehir: 'Başakşehir',
  bayrampasa: 'Bayrampaşa',
  besiktas: 'Beşiktaş',
  beykoz: 'Beykoz',
  beylikduzu: 'Beylikdüzü',
  beyoglu: 'Beyoğlu',
  buyukcekmece: 'Büyükçekmece',
  catalca: 'Çatalca',
  cekmekoy: 'Çekmeköy',
  esenler: 'Esenler',
  esenyurt: 'Esenyurt',
  eyupsultan: 'Eyüpsultan',
  fatih: 'Fatih',
  gaziosmanpasa: 'Gaziosmanpaşa',
  gungoren: 'Güngören',
  kadikoy: 'Kadıköy',
  kagithane: 'Kağıthane',
  kartal: 'Kartal',
  kucukcekmece: 'Küçükçekmece',
  maltepe: 'Maltepe',
  pendik: 'Pendik',
  sancaktepe: 'Sancaktepe',
  sariyer: 'Sarıyer',
  silivri: 'Silivri',
  sisli: 'Şişli',
  sultangazi: 'Sultangazi',
  sultanbeyli: 'Sultanbeyli',
  tuzla: 'Tuzla',
  umraniye: 'Ümraniye',
  uskudar: 'Üsküdar',
  zeytinburnu: 'Zeytinburnu',
  taksim: 'Taksim',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: cityParam, district: districtParam } = await params
  const city = cityParam.toLowerCase()
  const district = districtParam.toLowerCase()
  
  if (!validCities.includes(city) || !istanbulDistricts.includes(district)) {
    return {}
  }

  const cityName = cityNames[city]
  const districtName = districtNames[district]

  return {
    title: `${districtName} Otopark - ${cityName} ${districtName} Otopark Bul | Otoparkçım`,
    description: `${cityName} ${districtName}'de en uygun otopark fiyatlarını karşılaştır. ${districtName} otopark rezervasyonu, vale hizmeti ve aylık abonelik seçenekleri.`,
    keywords: `${district} otopark, ${cityName} ${districtName} otopark, ${district} otopark fiyatları, ${district} ucuz otopark`,
    openGraph: {
      title: `${districtName} Otopark | Otoparkçım`,
      description: `${cityName} ${districtName}'de en uygun otoparkları bul`,
      url: `https://www.otoparkcim.net/otopark/${city}/${district}`,
    },
    alternates: {
      canonical: `https://www.otoparkcim.net/otopark/${city}/${district}`,
    },
  }
}

export default async function DistrictPage({ params }: Props) {
  const { city: cityParam, district: districtParam } = await params
  const city = cityParam.toLowerCase()
  const district = districtParam.toLowerCase()

  if (!validCities.includes(city) || !istanbulDistricts.includes(district)) {
    notFound()
  }

  const cityName = cityNames[city]
  const districtName = districtNames[district]

  // Schema.org - Local Business + Breadcrumb
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "name": `Otoparkçım ${districtName}`,
        "description": `${cityName} ${districtName}'de otopark arama ve rezervasyon hizmeti`,
        "url": `https://www.otoparkcim.net/otopark/${city}/${district}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": districtName,
          "addressRegion": cityName,
          "addressCountry": "TR"
        },
        "priceRange": "₺₺"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Ana Sayfa",
            "item": "https://www.otoparkcim.net"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": cityName,
            "item": `https://www.otoparkcim.net/otopark/${city}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": districtName,
            "item": `https://www.otoparkcim.net/otopark/${city}/${district}`
          }
        ]
      }
    ]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm mb-4 text-gray-600">
        <Link href="/" className="hover:underline">Ana Sayfa</Link>
        {' > '}
        <Link href={`/otopark/${city}`} className="hover:underline">{cityName}</Link>
        {' > '}
        <span>{districtName}</span>
      </nav>

      <h1 className="text-4xl font-bold mb-6">
        {districtName} Otopark Arama
      </h1>
      
      <p className="text-lg mb-8">
        {cityName} {districtName}'de en uygun otopark fiyatlarını karşılaştırın ve online rezervasyon yapın.
      </p>

      <div className="grid gap-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {districtName} Otopark Fiyatları
          </h2>
          <p>
            {districtName} bölgesinde açık otopark, kapalı otopark ve vale hizmeti seçeneklerini 
            karşılaştırarak en uygun fiyatı bulabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Popüler Noktalar</h2>
          <p>
            {districtName} merkezinde, {districtName} AVM'de ve {districtName}'in 
            tüm popüler noktalarında otopark seçenekleri.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Rezervasyon Avantajları</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Online rezervasyon ile garantili park yeri</li>
            <li>Uygun fiyat garantisi</li>
            <li>7/24 müşteri desteği</li>
            <li>Hızlı ve güvenli ödeme</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

// Static params for build time
export async function generateStaticParams() {
  return istanbulDistricts.map((district) => ({
    city: 'istanbul',
    district: district,
  }))
}