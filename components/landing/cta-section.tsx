'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CtaSection() {
  const [showAppModal, setShowAppModal] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    
    const { error } = await supabase
      .from('app_waitlist')
      .insert([{ email }])

    setLoading(false)

    if (error) {
      if (error.code === '23505') { // Unique violation
        alert('Bu e-posta zaten kayıtlı!')
      } else {
        alert('Bir hata oluştu, lütfen tekrar dene.')
      }
    } else {
      setSuccess(true)
      setEmail('')
      setTimeout(() => {
        setShowAppModal(false)
        setSuccess(false)
      }, 2000)
    }
  }

  return (
    <>
      <section className="final">
        <div className="container">
          <h2>
            Park yerin seni bekliyor.
            <br />
            Sen değilsen kim?
          </h2>
          <p>30 saniyede kaydol, ilk parkında farkı gör.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/auth/register">
              <button className="btn btn-primary">Ücretsiz Başla</button>
            </Link>
            <button
              onClick={() => setShowAppModal(true)}
              className="btn btn-ghost"
              style={{ border: "1px solid var(--border-strong)", position: 'relative' }}
            >
              📱 Uygulamayı İndir
              <span style={{ 
                position: 'absolute', 
                top: -8, 
                right: -8, 
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                color: 'white',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 999,
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(245,158,11,0.4)'
              }}>
                YAKINDA
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* App Modal */}
      {showAppModal && (
        <div 
          onClick={() => setShowAppModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 24,
              padding: 40,
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            {success ? (
              <>
                <div style={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: 40
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>
                  Harika! 🎉
                </h3>
                <p style={{ fontSize: 16, color: 'var(--muted)' }}>
                  Uygulama yayınlandığında seni haberdar edeceğiz!
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: 40
                }}>
                  🚀
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>
                  Çok Yakında!
                </h3>
                <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
                  iOS ve Android uygulamalarımız üzerinde çalışıyoruz. Yayınlandığında ilk sen haberdar ol!
                </p>
                
                <form onSubmit={handleSubmit} style={{ 
                  background: 'var(--bg-2)', 
                  borderRadius: 16, 
                  padding: 20,
                  marginBottom: 24 
                }}>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresin"
                    style={{
                      width: '100%',
                      padding: 14,
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 14,
                      marginBottom: 10
                    }}
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: 14 }}
                  >
                    {loading ? 'Kaydediliyor...' : 'Haber Ver 🔔'}
                  </button>
                </form>

                <button 
                  onClick={() => setShowAppModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--faint)',
                    fontSize: 14,
                    cursor: 'pointer',
                    padding: 8
                  }}
                >
                  Kapat
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}