'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MapCard from "./map-card"

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchTerm)}`)
    } else {
      router.push('/dashboard')
    }
  }

  const handleChipClick = (location: string) => {
    router.push(`/dashboard?search=${encodeURIComponent(location)}`)
  }

  return (
    <header className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="container hero-inner">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            ŞU AN İSTANBUL'DA · 47 MÜSAİT
          </div>
          <h1>
            Park etmek
            <br />
            hiç bu kadar
            <br />
            <span className="accent">kolay olmamıştı.</span>
          </h1>
          <p className="sub">
            İstanbul'un 300+ anlaşmalı otoparkını canlı gör, fiyatları
            karşılaştır, tek tıkla yerini ayır. Artık saatlerce dolaşmak yok.
          </p>
          <div className="search-box">
            <input 
              placeholder="Nereye gidiyorsun? (Taksim, Kadıköy...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>Yer Bul</button>
          </div>
          <div className="quick-chips">
            <span className="chip" onClick={() => handleChipClick('Yakınımda')}>📍 Yakınımda</span>
            <span className="chip" onClick={() => handleChipClick('Taksim')}>Taksim</span>
            <span className="chip" onClick={() => handleChipClick('Kadıköy')}>Kadıköy</span>
            <span className="chip" onClick={() => handleChipClick('Havalimanı')}>Havalimanı</span>
            <span className="chip" onClick={() => handleChipClick('Beşiktaş')}>Beşiktaş</span>
          </div>
          <div className="hero-stats">
            <div>
              <div className="n">300+</div>
              <div className="l">Otopark</div>
            </div>
            <div>
              <div className="n">39</div>
              <div className="l">İlçe</div>
            </div>
            <div>
              <div className="n">7/24</div>
              <div className="l">Canlı</div>
            </div>
          </div>
        </div>

        <MapCard />
      </div>
    </header>
  )
}