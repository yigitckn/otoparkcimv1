export default function FeaturesSection() {
  return (
    <section id="features">
      <div className="container">
        <div className="section-head">
          <div className="kicker">NEDEN OTOPARKÇIM</div>
          <h2>İstanbul için özel olarak tasarlandı</h2>
          <p>
            Başka şehirler için değil. Sadece İstanbul'un trafiğini, yolları,
            ve sürücülerini düşünerek yapıldı.
          </p>
        </div>
        <div className="features">
          <div className="feat">
            <div
              className="feat-icon"
              style={{ background: "rgba(29,122,219,0.12)", color: "#1d7adb" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <span className="feat-tag">CANLI</span>
            <h3>Anlık Konum</h3>
            <p>
              En yakın otoparkları haritada gör, müsaitlik durumunu anında takip
              et.
            </p>
          </div>
          <div className="feat">
            <div
              className="feat-icon"
              style={{ background: "rgba(22,160,133,0.12)", color: "#16a085" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1v22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="feat-tag">EKONOMİK</span>
            <h3>Uygun Fiyat</h3>
            <p>
              Fiyatları karşılaştır, en ekonomik seçeneği bul. Çevrendeki en iyi
              tarifeyi kaçırma.
            </p>
          </div>
          <div className="feat">
            <div
              className="feat-icon"
              style={{ background: "rgba(74,160,235,0.15)", color: "#1d7adb" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <span className="feat-tag">KOLAY</span>
            <h3>Navigasyon</h3>
            <p>
              Tek tıkla yol tarifi al, otoparka kolayca ulaş. Dahili harita
              uygulamanla açılır.
            </p>
          </div>
          <div className="feat">
            <div
              className="feat-icon"
              style={{ background: "rgba(244,183,64,0.18)", color: "#b07a08" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="feat-tag">GÜVEN</span>
            <h3>Güvenli Park</h3>
            <p>
              Topluluk puanları, fotoğraf onayı ve kullanıcı yorumlarıyla gönül
              rahatlığıyla park et.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
