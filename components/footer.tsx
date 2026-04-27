import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot">
          <div>
            <Link href="/" className="logo">
              <span className="logo-badge">P</span>
              <span>
                Otopark<span className="acc">çım</span>
              </span>
            </Link>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 14,
                lineHeight: 1.6,
                marginTop: 16,
                maxWidth: 320,
              }}
            >
              İstanbul&apos;un park platformu. 300+ otopark, canlı müsaitlik,
              tek tıkla rezervasyon.
            </p>
          </div>
          <div>
            <h5>Ürün</h5>
            <ul>
              <li>
                <a href="#features">Özellikler</a>
              </li>
              <li>
                <a href="#fiyatlandirma">Fiyatlandırma</a>
              </li>
              <li>
                <a href="#">Uygulamayı İndir</a>
              </li>
              <li>
                <a href="#">Aylık Abonelik</a>
              </li>
            </ul>
          </div>
          <div>
            <h5>Bölgeler</h5>
            <ul>
              <li>
                <Link href="/dashboard?search=Kadıköy">Kadıköy Otoparkları</Link>
              </li>
              <li>
                <Link href="/dashboard?search=Beşiktaş">Beşiktaş Otoparkları</Link>
              </li>
              <li>
                <Link href="/dashboard?search=Taksim">Taksim Otoparkları</Link>
              </li>
              <li>
                <Link href="/dashboard?search=Havalimanı">Havalimanı</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Şirket</h5>
            <ul>
              <li>
                <Link href="/contact">Hakkımızda</Link>
              </li>
              <li>
                <Link href="/contact">İletişim</Link>
              </li>
              <li>
                <Link href="/privacy">Gizlilik</Link>
              </li>
              <li>
                <Link href="/terms">KVKK</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <div>© 2026 Otoparkçım · Tüm hakları saklıdır.</div>
          <div>Made with ♥ in İstanbul</div>
        </div>
      </div>
    </footer>
  );
}