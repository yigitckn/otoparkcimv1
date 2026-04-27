'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, HelpCircle, MapPin, Star, Settings, Shield, Camera } from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const categories = [
    {
      icon: HelpCircle,
      title: 'Genel Sorular',
      color: 'blue',
      faqs: [
        {
          q: 'Otoparkçım nedir?',
          a: 'Otoparkçım, İstanbul genelindeki otoparkları bulmanızı, fiyatları karşılaştırmanızı ve park geçmişinizi takip etmenizi sağlayan bir dijital platformdur. Anlık doluluk durumunu görebilir, en yakın otoparkları bulabilir ve check-in yaparak puan kazanabilirsiniz.'
        },
        {
          q: 'Üyelik ücretsiz mi?',
          a: 'Evet! Otoparkçım\'a üyelik tamamen ücretsizdir. Platform üzerinden otopark bilgilerini görüntülemek, aramak ve check-in yapmak tamamen bedava.'
        },
        {
          q: 'Hangi şehirlerde hizmet veriyorsunuz?',
          a: 'Şu anda sadece İstanbul\'da hizmet vermekteyiz. Tüm İstanbul ilçelerindeki otoparkları platformumuzda bulabilirsiniz.'
        },
        {
          q: 'Mobil uygulama var mı?',
          a: 'Şu anda web platformumuz üzerinden hizmet vermekteyiz. iOS ve Android uygulamalarımız yakında yayınlanacak!'
        }
      ]
    },
    {
      icon: MapPin,
      title: 'Otopark Arama',
      color: 'green',
      faqs: [
        {
          q: 'Nasıl otopark arayabilirim?',
          a: 'Ana sayfadan veya dashboard\'tan arama çubuğuna ilçe, mahalle veya otopark adı yazabilirsiniz. Harita üzerinden de yakınınızdaki otoparkları görebilirsiniz.'
        },
        {
          q: 'En yakın otoparkları nasıl bulabilirim?',
          a: 'Konum izni verdiğinizde, size en yakın otoparklar otomatik olarak listelenir. "Yakınımda" filtresini kullanarak 3 km çapındaki otoparkları görebilirsiniz.'
        },
        {
          q: 'Fiyatları nasıl görebilirim?',
          a: 'Giriş yaptıktan sonra tüm otopark fiyatlarını görebilirsiniz. Giriş yapmadan sadece otopark konumlarını ve isimlerini görebilirsiniz.'
        },
        {
          q: 'Müsait yer var mı nasıl anlarım?',
          a: 'Her otopark kartında doluluk durumu gösterilir: Yeşil (Müsait), Sarı (Az Yer Var), Kırmızı (Dolu). Bu bilgiler gerçek zamanlı güncellenir.'
        }
      ]
    },
    {
      icon: Camera,
      title: 'Check-in ve Puan Sistemi',
      color: 'purple',
      faqs: [
        {
          q: 'Check-in nasıl yapabilirim?',
          a: 'Park ettiğiniz otoparkın detay sayfasında "Park Ettim" butonuna tıklayın. Araç ve otopark görseli içeren bir fotoğraf yükleyin. Fotoğraf onaylandıktan sonra check-in kaydınız oluşturulur.'
        },
        {
          q: 'Nasıl puan kazanabilirim?',
          a: 'Her onaylı check-in için 1 damga kazanırsınız. 10 damga topladığınızda 1 ücretsiz park hakkı kazanırsınız. Check-in için mutlaka fotoğraf yüklemeniz gerekir.'
        },
        {
          q: 'Check-in fotoğrafı nasıl olmalı?',
          a: 'Fotoğrafta hem aracınız hem de otopark tabelası/girişi görünmelidir. Net ve güncel olmalıdır. Eski fotoğraflar veya başka yerlerden alınan görseller kabul edilmez.'
        },
        {
          q: 'Puanlarım ne zaman sona eriyor?',
          a: 'Damgalarınızın son kullanma tarihi yoktur! Hesabınız aktif olduğu sürece damgalarınız birikmeye devam eder.'
        },
        {
          q: 'Ücretsiz park hakkımı nasıl kullanabilirim?',
          a: '10 damganızı tamamladığınızda, bir sonraki check-in\'inizde otomatik olarak yeni bir damga kartı başlar ve eski kartınız "Kullanıma Hazır" olarak işaretlenir. Katılımcı otoparkların listesini profil sayfanızdan görebilirsiniz.'
        }
      ]
    },
    {
      icon: Star,
      title: 'Otopark Değerlendirme',
      color: 'yellow',
      faqs: [
        {
          q: 'Otopark yorumu nasıl yapabilirim?',
          a: 'Check-in yaptığınız otoparklar için yorum ve puan bırakabilirsiniz. Profil > Park Geçmişi bölümünden geçmiş check-in\'lerinizi görebilir ve değerlendirme yapabilirsiniz.'
        },
        {
          q: 'Güven puanı nedir?',
          a: 'Otoparkların kullanıcı değerlendirmelerine göre hesaplanan genel puanıdır. Güvenlik, temizlik, fiyat ve hizmet kalitesi gibi kriterleri içerir.'
        },
        {
          q: 'Şikayet nasıl yapabilirim?',
          a: 'Otopark detay sayfasında "Sorun Bildir" butonunu kullanabilir veya İletişim sayfasından bize ulaşabilirsiniz.'
        }
      ]
    },
    {
      icon: Settings,
      title: 'Hesap Yönetimi',
      color: 'gray',
      faqs: [
        {
          q: 'Şifremi unuttum, ne yapmalıyım?',
          a: 'Giriş ekranında "Şifremi Unuttum" linkine tıklayın. E-posta adresinize şifre sıfırlama linki gönderilecektir.'
        },
        {
          q: 'E-posta adresimi nasıl değiştirebilirim?',
          a: 'Profil > Ayarlar > Hesap Bilgileri bölümünden e-posta adresinizi güncelleyebilirsiniz. Değişiklik için doğrulama maili gönderilecektir.'
        },
        {
          q: 'Hesabımı nasıl silebilirim?',
          a: 'Profil > Ayarlar > Hesabı Kapat bölümünden hesabınızı kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz ve tüm verileriniz (check-in geçmişi, damgalar) silinir.'
        },
        {
          q: 'Bildirim ayarlarımı nasıl değiştirebilirim?',
          a: 'Profil > Ayarlar > Bildirimler bölümünden e-posta ve push bildirim tercihlerinizi yönetebilirsiniz.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Güvenlik ve Gizlilik',
      color: 'red',
      faqs: [
        {
          q: 'Kişisel bilgilerim güvende mi?',
          a: 'Evet! Tüm kişisel verileriniz SSL şifreleme ile korunur ve KVKK uyumlu olarak saklanır. Detaylı bilgi için Gizlilik Politikamızı inceleyebilirsiniz.'
        },
        {
          q: 'Yüklediğim fotoğraflar ne oluyor?',
          a: 'Check-in fotoğraflarınız sadece doğrulama amaçlı kullanılır ve güvenli bulut depolama sisteminde saklanır. Üçüncü taraflarla paylaşılmaz.'
        },
        {
          q: 'Konum bilgilerim paylaşılıyor mu?',
          a: 'Konum bilgileriniz sadece size yakın otoparkları göstermek için kullanılır ve üçüncü taraflarla paylaşılmaz. İstediğiniz zaman konum iznini kapatabilirsiniz.'
        },
        {
          q: 'Hesabım hack\'lendiyse ne yapmalıyım?',
          a: 'Hemen destek@otoparkcim.com adresine mail atın veya +90 (212) 123 45 67 numarasından bizi arayın. Hesabınızı derhal askıya alacağız.'
        }
      ]
    }
  ]

  const filteredCategories = categories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(faq => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.faqs.length > 0)

  const getColorClasses = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      gray: 'bg-gray-100 text-gray-600',
      red: 'bg-red-100 text-red-600'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Yardım Merkezi</h1>
          <p className="text-lg mb-8 text-blue-100">
            Size nasıl yardımcı olabiliriz?
          </p>
          
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Soru veya anahtar kelime arayın..."
              className="w-full py-4 pl-12 pr-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">7/24</div>
            <p className="text-gray-600">E-posta Desteği</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">45+</div>
            <p className="text-gray-600">Sık Sorulan Soru</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">&lt;24 saat</div>
            <p className="text-gray-600">Ortalama Yanıt Süresi</p>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, catIndex) => (
              <div key={catIndex} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(category.color)}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                </div>

                <div className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = catIndex * 100 + faqIndex
                    const isOpen = openFaq === globalIndex

                    return (
                      <div key={faqIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : globalIndex)}
                          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                            <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aramanızla eşleşen sonuç bulunamadı.</p>
              <p className="text-gray-400 mt-2">Lütfen farklı bir anahtar kelime deneyin.</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Aradığınızı bulamadınız mı?</h3>
          <p className="text-gray-600 mb-6">
            Destek ekibimiz size yardımcı olmaktan mutluluk duyar!
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            Bize Ulaşın
          </Link>
        </div>
      </main>
    </div>
  )
}