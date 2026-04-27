export default function HowItWorksSection() {
  return (
    <section id="how" style={{ background: "rgba(219,233,247,0.5)" }}>
      <div className="container">
        <div className="section-head">
          <div className="kicker">NASIL ÇALIŞIR</div>
          <h2>Park et, fotoğraf yükle, puan kazan</h2>
          <p>3 basit adım. Ücretsiz parka giden yol bu kadar kısa.</p>
        </div>
        <div className="how">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-mock">
              <div className="scene-search">
                <div className="fake-input">Nişantaşı</div>
                <div className="chips-row">
                  <span className="mchip">Yakın</span>
                  <span className="mchip">Ucuz</span>
                  <span className="mchip">Kapalı</span>
                </div>
              </div>
            </div>
            <h4>Otoparkı bul</h4>
            <p>
              Adres veya semt yaz, en yakın müsait otoparkları gör. Tek tıkla
              yol tarifi al, aracını park et.
            </p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-mock">
              <div className="scene-photo">
                <div className="frame">
                  <div className="plate">34 ABC 123</div>
                  <div className="check-badge">✓</div>
                </div>
                <span className="pts">★ +1 PARK DAMGASI</span>
              </div>
            </div>
            <h4>Fotoğraf yükle</h4>
            <p>
              Park ettiğin yerin fotoğrafını çek, plaka görünsün yeter. Sistem
              otomatik onaylar.
            </p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-mock">
              <div className="scene-confirm">
                <div
                  className="check"
                  style={{ background: "#f4b740", color: "#fff" }}
                >
                  ★
                </div>
                <div className="ttl">Damgan Eklendi</div>
                <div className="sml">7 / 10 · 3 park sonra bedava</div>
                <div className="row">
                  <span>Toplam Puan</span>
                  <span>340</span>
                </div>
                <div className="row">
                  <span>Sıradaki ödül</span>
                  <span style={{ color: "var(--accent)" }}>Ücretsiz Park</span>
                </div>
              </div>
            </div>
            <h4>Puan biriktir</h4>
            <p>
              Her onaylı park bir damga. 10 damga = 1 ücretsiz park. Sadık
              kullanıcılar her zaman kazanır.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
