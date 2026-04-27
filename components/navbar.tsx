import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          <span className="logo-badge">P</span>
          <span>
            Otopark<span className="acc">çım</span>
          </span>
        </Link>
        <div className="nav-links">
          <a href="#features">Özellikler</a>
          <a href="#how">Nasıl Çalışır</a>
          <a href="#owners">Otopark Sahipleri</a>
          <a href="#fiyatlandirma">Fiyatlandırma</a>
        </div>
        <div className="nav-cta">
          <Link href="/auth/login">
            <button className="btn btn-ghost">Giriş Yap</button>
          </Link>
          <Link href="/auth/register">
            <button className="btn btn-primary">Hemen Başla</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}