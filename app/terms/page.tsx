import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Kullanım Şartları</h1>
        <p className="text-gray-600 mb-8">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Hizmet Tanımı</h2>
            <p className="text-gray-700 leading-relaxed">
              Otoparkçım, İstanbul genelindeki otoparkları bulmanıza, karşılaştırmanıza ve park geçmişinizi takip etmenize olanak tanıyan bir dijital platformdur. Bu platformu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Kullanıcı Sorumlulukları</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Platform kullanıcısı olarak:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Kayıt sırasında doğru ve güncel bilgiler vermeyi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Hesap güvenliğinizi korumayı ve şifrenizi kimseyle paylaşmamayı</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Platformu yasal amaçlar için kullanmayı</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Check-in fotoğraflarında gerçek park durumunuzu paylaşmayı</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Diğer kullanıcılara ve otopark işletmelerine saygılı davranmayı</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              taahhüt edersiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Check-in ve Park Kaydı</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Check-in Sistemi</h3>
                <p className="text-gray-700">
                  Park ettiğinizde "Park Ettim" butonuna tıklayarak check-in yapabilirsiniz. Check-in işlemi için park yerinizin fotoğrafını yüklemeniz gerekmektedir.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Fotoğraf Doğrulaması</h3>
                <p className="text-gray-700">
                  Yüklediğiniz fotoğraflar sistem tarafından doğrulanır. Sahte veya yanıltıcı fotoğraf yüklenmesi durumunda check-in kaydınız iptal edilir ve puan kazanamazsınız.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Park Geçmişi</h3>
                <p className="text-gray-700">
                  Tüm check-in kayıtlarınız profil sayfanızda saklanır. Park geçmişinizi dilediğiniz zaman görüntüleyebilirsiniz.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Fiyat Gösterimi</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Platform üzerinde gösterilen fiyatlar:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Otopark işletmeleri tarafından belirlenir ve güncellenebilir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Bilgilendirme amaçlıdır, değişiklik gösterebilir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>KDV dahildir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Ödeme işlemleri doğrudan otopark işletmesi ile yapılır</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Puan ve Damga Kartı Sistemi</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Otoparkçım Plus damga kartı programı:
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Her onaylı check-in için 1 damga kazanırsınız</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>10 damga = 1 ücretsiz park hakkı</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Damgalar hesap kapatılana kadar geçerlidir</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Sahte check-in tespiti durumunda tüm damgalar iptal edilir</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Ücretsiz park hakkı belirli otoparklar için geçerlidir</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Otopark İşletmelerinin Sorumlulukları</h2>
            <p className="text-gray-700 leading-relaxed">
              Otoparkçım bir bilgilendirme platformudur. Otopark hizmetleri doğrudan işletmeler tarafından sağlanır. Araç hasarı, kayıp eşya, fiyat farklılıkları veya otopark işletmesinin doğrudan sorumluluğundaki diğer sorunlar için Otoparkçım sorumlu tutulamaz. Bu tür durumlar için doğrudan işletme ile iletişime geçmeniz gerekmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Fikri Mülkiyet</h2>
            <p className="text-gray-700 leading-relaxed">
              Platform üzerindeki tüm içerik, tasarım, logo, yazılım ve diğer materyaller Otoparkçım'a aittir ve telif hakları ile korunmaktadır. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Hizmet Değişiklikleri</h2>
            <p className="text-gray-700 leading-relaxed">
              Otoparkçım, önceden haber vermeksizin platformu geliştirme, değiştirme veya sonlandırma hakkını saklı tutar. Önemli değişiklikler hakkında kullanıcılar bilgilendirilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Hesap Askıya Alma ve Kapatma</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Aşağıdaki durumlarda hesabınız askıya alınabilir veya kapatılabilir:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Kullanım şartlarını ihlal etmek</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Sahte bilgi vermek veya dolandırıcılık yapmak</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Sahte check-in fotoğrafları yüklemek</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Platform güvenliğini tehdit etmek</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Diğer kullanıcıları rahatsız etmek veya taciz etmek</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Sorumluluk Reddi</h2>
            <p className="text-gray-700 leading-relaxed">
              Platform "olduğu gibi" sunulmaktadır. Otoparkçım, platformun kesintisiz veya hatasız çalışacağını garanti etmez. Teknik arızalar, veri kaybı, fiyat bilgisi farklılıkları veya hizmet kesintileri nedeniyle oluşabilecek zararlardan sorumlu değildir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Uyuşmazlık Çözümü</h2>
            <p className="text-gray-700 leading-relaxed">
              Bu kullanım şartlarından kaynaklanan uyuşmazlıklar öncelikle iyi niyetle çözülmeye çalışılacaktır. Çözülemediği takdirde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. İletişim</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Kullanım şartları hakkında sorularınız için:
            </p>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-gray-900"><strong>E-posta:</strong> otoparkciminfo@gmail.com</p>
              <p className="text-gray-900 mt-2"><strong>Adres:</strong> İstanbul, Türkiye</p>
            </div>
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