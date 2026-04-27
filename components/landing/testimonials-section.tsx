export default function TestimonialsSection() {
  return (
    <section>
      <div className="container">
        <div className="section-head">
          <div className="kicker">KULLANICILAR NE DİYOR</div>
          <h2>500+ sürücü İstanbul'da daha kolay park ediyor</h2>
        </div>
        <div className="testimonials">
          <div className="testi">
            <div className="stars">★★★★★</div>
            <div className="quote">
              &quot;Taksim&apos;de iş toplantısı vardı, 5 dakikada yer ayırttım.
              Eskiden yarım saat arardım. Hayatımı kolaylaştırdı.&quot;
            </div>
            <div className="who">
              <div
                className="avatar"
                style={
                  {
                    "--c1": "#1d7adb",
                    "--c2": "#4aa0eb",
                  } as React.CSSProperties
                }
              >
                BA
              </div>
              <div>
                <div className="name">Baran A.</div>
                <div className="loc">Kağıthane</div>
              </div>
            </div>
          </div>
          <div className="testi">
            <div className="stars">★★★★★</div>
            <div className="quote">
              &quot;Havalimanından dönüşte otomatik bariyer açıldı, süper oldu.
              Aylık abonelikle ofisin yanında sabit yerim var artık.&quot;
            </div>
            <div className="who">
              <div
                className="avatar"
                style={
                  {
                    "--c1": "#16a085",
                    "--c2": "#1d7adb",
                  } as React.CSSProperties
                }
              >
                ZK
              </div>
              <div>
                <div className="name">Zeynep K.</div>
                <div className="loc">Beşiktaş · Aylık üye</div>
              </div>
            </div>
          </div>
          <div className="testi">
            <div className="stars">★★★★★</div>
            <div className="quote">
              &quot;Fiyat karşılaştırma özelliği müthiş. Aynı bölgede 3 kat fark
              olabiliyormuş meğer. Ayda 400₺ tasarruf ediyorum.&quot;
            </div>
            <div className="who">
              <div
                className="avatar"
                style={
                  {
                    "--c1": "#ef4444",
                    "--c2": "#f97316",
                  } as React.CSSProperties
                }
              >
                EY
              </div>
              <div>
                <div className="name">Emre Y.</div>
                <div className="loc">Şişli · 6 aydır kullanıyor</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
