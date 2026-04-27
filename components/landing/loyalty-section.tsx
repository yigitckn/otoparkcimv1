export default function LoyaltySection() {
  return (
    <section style={{ padding: "40px 0 0" }}>
      <div className="container">
        <div className="loyalty">
          <div>
            <div className="l-kicker">Otoparkçım Plus</div>
            <h2>
              10 park yap,
              <br />
              <em>1 park bizden.</em>
            </h2>
            <p>
              Her onaylı park bir damga kazandırır. 10 damga doldurduğunda bir
              sonraki parkın tamamen ücretsiz. Ne abonelik, ne ek ücret —
              sadece kullandıkça kazan.
            </p>
            <button className="l-cta">Nasıl Çalışır →</button>
          </div>
          <div className="stamps">
            <div className="stamps-head">
              <span>Damga Kartım</span>
              <span className="pill">7 / 10</span>
            </div>
            <div className="stamps-grid">
              <div className="stamp done">✓</div>
              <div className="stamp done">✓</div>
              <div className="stamp done">✓</div>
              <div className="stamp done">✓</div>
              <div className="stamp done">✓</div>
              <div className="stamp done">✓</div>
              <div className="stamp done">✓</div>
              <div className="stamp">8</div>
              <div className="stamp">9</div>
              <div className="stamp reward">★</div>
            </div>
            <div className="stamps-foot">
              3 park sonra bedava park kazanırsın.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
