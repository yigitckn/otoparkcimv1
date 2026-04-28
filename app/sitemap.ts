// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.otoparkcim.net'
  
  // Ana sayfa
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Şehir sayfaları - SEO için önemli!
  const cities = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya']
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${baseUrl}/otopark/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

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
  const districtPages: MetadataRoute.Sitemap = istanbulDistricts.map((district) => ({
    url: `${baseUrl}/otopark/istanbul/${district}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...routes, ...cityPages, ...districtPages]
}