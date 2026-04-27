import Link from 'next/link'

export default function OwnerSection() {
  return (
    <section id="owners">
      <div className="container">
        <div className="owner">
          <div>
            <div
              className="kicker"
              style={{
                color: "var(--accent)",
                fontSize: 12,
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              OTOPARK SAHİPLERİNE
            </div>
            <h2>Otoparkını binlerce sürücüye duyur</h2>
            <p>
              Otoparkını Otoparkçım&apos;a ekle, İstanbul&apos;un her yerinden
              sürücüler seni görsün. Konumunu, fiyatlarını ve fotoğraflarını
              paylaş — yeni müşteri kazan.
            </p>
            <div className="owner-stats">
              <div>
                <div className="n">300+</div>
                <div className="l">Listeli Otopark</div>
              </div>
              <div>
                <div className="n">%0</div>
                <div className="l">Listeleme Ücreti</div>
              </div>
              <div>
                <div className="n">5dk</div>
                <div className="l">Kurulum Süresi</div>
              </div>
            </div>
            <Link href="/owner/register">
             <button className="btn btn-primary" style={{ padding: "12px 24px" }}>
               Otoparkını Ekle →
             </button>
            </Link>
          </div>
          <div className="owner-mock">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>Otoparkınız</div>
              <div style={{ fontSize: 11, color: "var(--faint)" }}>Aktif</div>
            </div>
            <div className="mrow">
              <span className="lbl">Profil Görüntülenme</span>
              <span className="val">1.247</span>
            </div>
            <div className="mrow">
              <span className="lbl">Yol Tarifi Alınma</span>
              <span className="val pos">↑ 318</span>
            </div>
            <div className="mrow">
              <span className="lbl">Onaylı Park</span>
              <span className="val pos">247</span>
            </div>
            <div className="mrow">
              <span className="lbl">Ortalama Puan</span>
              <span className="val">⭐ 4.8</span>
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 10,
                color: "var(--faint)",
              }}
            >
              Kullanıcı fotoğraflarıyla doğrulanmış istatistikler
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}