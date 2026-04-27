import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Gizlilik Politikası</h1>
        <p className="text-gray-600 mb-8">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Giriş</h2>
            <p className="text-gray-700 leading-relaxed">
              Otoparkçım olarak, kullanıcılarımızın gizliliğini korumayı taahhüt ediyoruz. Bu gizlilik politikası, kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Toplanan Bilgiler</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Hizmetlerimizi kullanırken aşağıdaki bilgileri toplayabiliriz:
            </p>
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <p className="text-gray-700"><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası</p>
              <p className="text-gray-700"><strong>Konum Bilgileri:</strong> Park ettiğiniz yerlerin konumu, arama geçmişiniz, size en yakın otoparkları göstermek için konumunuz</p>
              <p className="text-gray-700"><strong>Fotoğraf Verileri:</strong> Check-in için yüklediğiniz park fotoğrafları (puan sistemi doğrulaması için)</p>
              <p className="text-gray-700"><strong>Kullanım Verileri:</strong> Uygulama kullanım istatistikleri, arama geçmişi, tercihler</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Bilgilerin Kullanımı</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Topladığımız bilgileri şu amaçlarla kullanırız:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Size en yakın otoparkları göstermek ve konuma özel öneriler sunmak</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Park geçmişinizi kaydetmek ve damga kartı sistemi için kullanmak</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Check-in fotoğraflarını doğrulamak ve puan sisteminizi yönetmek</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Müşteri desteği sağlamak</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Hizmetlerimizi geliştirmek ve kişiselleştirmek</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. KVKK Uyumu</h2>
            <p className="text-gray-700 leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, kişisel verileriniz güvenli bir şekilde saklanmakta ve yalnızca belirtilen amaçlar doğrultusunda işlenmektedir. Verilerinizin işlenmesine ilişkin açık rızanız alınmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Veri Güvenliği</h2>
            <p className="text-gray-700 leading-relaxed">
              Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. Verileriniz şifrelenmiş sunucularda saklanır ve yetkisiz erişime karşı korunur. Check-in fotoğraflarınız güvenli bulut depolama sisteminde saklanır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Üçüncü Taraf Paylaşımı</h2>
            <p className="text-gray-700 leading-relaxed">
              Kişisel bilgilerinizi, yasal yükümlülükler veya açık izniniz olmadan üçüncü taraflarla paylaşmayız. Harita hizmetleri için Google Maps API kullanılmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Çerezler (Cookies)</h2>
            <p className="text-gray-700 leading-relaxed">
              Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Haklarınız</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>İşlenmişse buna ilişkin bilgi talep etme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Eksik veya yanlış işlenmişse düzeltilmesini isteme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Verilerinizin silinmesini veya yok edilmesini talep etme</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. İletişim</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Gizlilik politikamız hakkında sorularınız varsa veya haklarınızı kullanmak isterseniz bizimle iletişime geçebilirsiniz:
            </p>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-gray-900"><strong>E-posta:</strong> otoparkciminfo@gmail.com</p>
              <p className="text-gray-900 mt-2"><strong>Adres:</strong> İstanbul, Türkiye</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Politika Güncellemeleri</h2>
            <p className="text-gray-700 leading-relaxed">
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda sizi bilgilendireceğiz.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    </div>
  )
}