'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Feature {
  text: string
  bold: boolean
  kind?: string
  emoji?: string
}

interface Plan {
  id: string
  name: string
  duration: string
  price: number
  pricePerMonth: number
  badge: { text: string; tone: string } | null
  accent: string
  tagline: string
  features: Feature[]
}

const PLANS: Plan[] = [
  {
    id: '1m',
    name: '1 Aylık Plan',
    duration: '1 ay',
    price: 350,
    pricePerMonth: 350,
    badge: null,
    accent: 'slate',
    tagline: 'Önce dene, sonra büyüt',
    features: [
      { text: 'Otoparkınız 1 ay boyunca listede görünür', bold: false },
      { text: 'Profil görüntülenme istatistikleri', bold: false },
      { text: 'Yol tarifi tıklama sayısı', bold: false },
      { text: 'Onaylı park kayıtlarını görüntüleme', bold: false },
      { text: '7/24 Türkçe destek', bold: false },
    ],
  },
  {
    id: '3m',
    name: '3 Aylık Plan',
    duration: '3 ay',
    price: 500,
    pricePerMonth: Math.round(500 / 3),
    badge: { text: 'POPÜLER', tone: 'blue' },
    accent: 'blue',
    tagline: 'Çoğu işletmenin tercihi',
    features: [
      { text: 'Otoparkınız 3 ay boyunca listede görünür', bold: false },
      { text: 'Tüm istatistikler', bold: false },
      { text: '7/24 Türkçe destek', bold: false },
      { text: '%30 tasarruf', bold: true, kind: 'save' },
    ],
  },
  {
    id: '6m',
    name: '6 Aylık Plan',
    duration: '6 ay',
    price: 750,
    pricePerMonth: Math.round(750 / 6),
    badge: { text: 'AVANTAJLI', tone: 'violet' },
    accent: 'violet',
    tagline: '1 ay hediye, daha fazla görünürlük',
    features: [
      { text: 'Otoparkınız 6 ay boyunca listede görünür', bold: false },
      { text: 'Tüm istatistikler', bold: false },
      { text: '1 AY ÜCRETSİZ ÖNCELİKLİ LİSTELEME HEDİYE', bold: true, kind: 'gift', emoji: '🎁' },
      { text: '7/24 Türkçe destek', bold: false },
      { text: '%64 tasarruf', bold: true, kind: 'save' },
    ],
  },
  {
    id: '12m',
    name: '1 Yıllık Plan',
    duration: '12 ay',
    price: 1499,
    pricePerMonth: Math.round(1499 / 12),
    badge: { text: 'EN İYİ DEĞER', tone: 'amber' },
    accent: 'amber',
    tagline: 'En düşük aylık maliyet',
    features: [
      { text: 'Otoparkınız 12 ay boyunca listede görünür', bold: false },
      { text: 'Tüm istatistikler', bold: false },
      { text: '2 AY ÜCRETSİZ ÖNCELİKLİ LİSTELEME HEDİYE', bold: true, kind: 'gift', emoji: '🎁' },
      { text: 'VIP destek', bold: true, kind: 'vip' },
      { text: '%64 tasarruf', bold: true, kind: 'save' },
    ],
  },
]

const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M5 10.5l3 3 7-7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ShieldIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3l8 3v6c0 5-3.5 8.2-8 9-4.5-.8-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M8.5 12l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const BoltIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)

const HeadsetIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 13a8 8 0 1 1 16 0v4a3 3 0 0 1-3 3h-2v-7h5M4 13v4a3 3 0 0 0 3 3h2v-7H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)

const ArrowIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)


const Badge = ({ badge }: { badge: Plan['badge'] }) => {
  if (!badge) return null
  const styles: Record<string, string> = {
    blue:   'bg-[#1d7adb] text-white',
    violet: 'bg-[#7c3aed] text-white',
    amber:  'plan-badge-shimmer text-[#92400e]',
  }
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold tracking-[0.14em] ${styles[badge.tone] ?? 'bg-[#0b1c35] text-white'}`}>
      {badge.tone === 'amber' && (
        <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
          <path d="M8 1.5l1.9 4.1 4.5.5-3.4 3 1 4.4L8 11.2 4 13.5l1-4.4-3.4-3 4.5-.5L8 1.5z"/>
        </svg>
      )}
      {badge.text}
    </div>
  )
}

const PlanCard = ({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: (id: string) => void }) => {
  const isPopular = plan.badge?.tone === 'blue'
  const isBest    = plan.badge?.tone === 'amber'

  const borderClass = selected
    ? 'border-[#1d7adb]'
    : isPopular  ? 'border-[#d6e8fb]'
    : isBest     ? 'border-[#fef3c7]'
    : plan.accent === 'violet' ? 'border-[#e7daff]'
    : 'border-slate-200/80'

  const cardShadow = selected
    ? '0 0 0 2px #1d7adb, 0 20px 50px rgba(29,122,219,0.22)'
    : '0 1px 2px rgba(11,28,53,0.04), 0 8px 24px rgba(11,28,53,0.06)'

  return (
    <button
      type="button"
      onClick={() => onSelect(plan.id)}
      aria-pressed={selected}
      className={`group relative text-left bg-white rounded-3xl border ${borderClass} flex flex-col transition-all duration-200 hover:-translate-y-0.5`}
      style={{ boxShadow: cardShadow }}
    >
      {isPopular && (
        <div className="absolute inset-x-0 -top-px h-1 rounded-t-3xl"
             style={{ background: 'linear-gradient(90deg, #1d7adb, #4aa0eb)' }}/>
      )}
      {isBest && (
        <div className="absolute inset-x-0 -top-px h-1 rounded-t-3xl plan-badge-shimmer"/>
      )}

      <div className="px-6 pt-6 min-h-[34px] flex items-start">
        <Badge badge={plan.badge}/>
      </div>

      <div className="px-6 pt-2">
        <div className="text-[13px] font-semibold tracking-wide text-[#5a6c8a] uppercase">{plan.duration}</div>
        <h3 className="mt-1 text-[22px] font-extrabold tracking-tight text-[#0b1c35] leading-tight">{plan.name}</h3>
        <p className="mt-1.5 text-[13px] text-[#33476a] leading-snug">{plan.tagline}</p>
      </div>

      <div className="px-6 mt-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[44px] font-extrabold tracking-tight text-[#0b1c35] leading-none">
            {plan.price.toLocaleString('tr-TR')}<span className="text-[28px] font-bold align-top">₺</span>
          </span>
        </div>
        <div className="mt-1.5 text-[12.5px] text-[#5a6c8a] font-medium">
          {plan.id === '1m'
            ? 'aylık ödeme'
            : <span>→ <span className="font-semibold text-[#142a4a]">{plan.pricePerMonth}₺ / ay</span> · tek seferde</span>
          }
        </div>
      </div>

      <div className="mx-6 mt-6 mb-5 h-px bg-slate-200/70"/>

      <ul className="px-6 pb-6 space-y-3 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={`mt-0.5 inline-flex w-5 h-5 rounded-full items-center justify-center flex-shrink-0
                              ${f.kind === 'gift' ? 'bg-[#f4eeff] text-[#7c3aed]'
                              : f.kind === 'save' ? 'bg-emerald-100 text-emerald-700'
                              : f.kind === 'vip'  ? 'bg-[#fef3c7] text-[#92400e]'
                              : 'bg-[#d6e8fb] text-[#1769c2]'}`}>
              <CheckIcon className="w-3.5 h-3.5"/>
            </span>
            <span className={`text-[13.5px] leading-snug ${f.bold ? 'font-bold text-[#0b1c35]' : 'text-[#142a4a]'}`}>
              {f.text}{f.emoji ? ' ' + f.emoji : ''}
            </span>
          </li>
        ))}
      </ul>

      <div className="px-6 pb-6">
        <div
          className={`w-full h-11 rounded-xl font-bold text-[14px] flex items-center justify-center transition-all
                      ${selected
                        ? 'text-white'
                        : 'bg-slate-100 text-[#142a4a] group-hover:bg-[#142a4a] group-hover:text-white'}`}
          style={selected ? { background: '#1d7adb', boxShadow: '0 8px 20px rgba(29,122,219,0.30)' } : {}}
        >
          {selected ? (
            <span className="plan-check-pop inline-flex items-center gap-2">
              <CheckIcon className="w-4 h-4"/> Seçildi
            </span>
          ) : 'Seç'}
        </div>
      </div>
    </button>
  )
}

const Trust = () => {
  const items = [
    { icon: <ShieldIcon  className="w-[18px] h-[18px]"/>, t: 'Güvenli ödeme',      s: '' },
    { icon: <BoltIcon    className="w-[18px] h-[18px]"/>, t: 'Anında aktivasyon',   s: 'Ödeme sonrası listede' },
    { icon: <HeadsetIcon className="w-[18px] h-[18px]"/>, t: 'Türkçe destek',       s: '' },
  ]
  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/80 border border-slate-200/70 rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-[#eef6fe] text-[#1769c2] flex items-center justify-center flex-shrink-0">
            {it.icon}
          </div>
          <div className="leading-tight">
            <div className="text-[13.5px] font-bold text-[#0b1c35]">{it.t}</div>
            <div className="text-[12px] text-[#5a6c8a] mt-0.5">{it.s}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const FAQ = () => {
  const [open, setOpen] = useState(0)
  const qs = [
    {
      q: 'Ödeme nasıl yapılır?',
      a: 'Paket seçiminizin ardından ödeme bilgilerinizi WhatsApp veya e-posta yoluyla iletiyoruz. Havale/EFT ile ödeme yapılmaktadır.',
    },
    {
      q: 'Plan süresi içinde iptal edebilir miyim?',
      a: 'Evet. Aktif planınızı dilediğiniz an dondurabilir veya iptal edebilirsiniz. Kullanılmayan günler bir sonraki dönemde değerlendirilir.',
    },
    {
      q: '"Öncü Listeleme" tam olarak nedir?',
      a: 'Otoparkınız harita ve arama sonuçlarında ilk sıralarda öne çıkar; bu süre boyunca rakiplerinizden 4–6× daha fazla görüntülenme alır.',
    },
    {
      q: 'Daha sonra üst pakete geçebilir miyim?',
      a: 'Elbette. Mevcut planınızın kalan değeri yeni planınızdan düşülerek otomatik olarak uygulanır.',
    },
  ]
  return (
    <div className="mt-16 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-[11px] font-bold tracking-[0.22em] text-[#5a6c8a]">SIKÇA SORULAN SORULAR</div>
        <h2 className="text-[26px] font-extrabold tracking-tight text-[#0b1c35] mt-1.5">Aklınızda kalan var mı?</h2>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
           style={{ boxShadow: '0 1px 2px rgba(11,28,53,0.04), 0 8px 24px rgba(11,28,53,0.06)' }}>
        {qs.map((it, i) => (
          <div key={i} className={i > 0 ? 'border-t border-slate-100' : ''}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-slate-50/70 transition-colors"
            >
              <span className="text-[14.5px] font-bold text-[#0b1c35]">{it.q}</span>
              <span className={`w-7 h-7 rounded-full bg-slate-100 text-[#142a4a] flex items-center justify-center flex-shrink-0 transition-transform ${open === i ? 'rotate-45' : ''}`}>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-5 -mt-1 text-[13.5px] text-[#33476a] leading-relaxed">{it.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PlansPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const selectedPlan = useMemo(() => PLANS.find(p => p.id === selected) ?? null, [selected])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

  const handleContinue = async () => {
    if (!selectedPlan || !user) return
    setLoading(true)

    const { error } = await supabase
      .from('ownership_claims')
      .update({
        package_type: selectedPlan.id,
        package_price: selectedPlan.price,
      })
      .eq('user_id', user.id)
      .eq('claim_type', 'owner_registration')

    if (error) {
      console.error('Update error:', error)
      setLoading(false)
      return
    }

    router.push('/owner/success')
  }

  return (
    <>
      <style>{`
        @keyframes plan-shimmer {
          0%   { background-position: -200% 0 }
          100% { background-position:  200% 0 }
        }
        .plan-badge-shimmer {
          background: linear-gradient(110deg, #fde68a 0%, #fbbf24 30%, #f59e0b 50%, #fbbf24 70%, #fde68a 100%);
          background-size: 200% 100%;
          animation: plan-shimmer 3.5s linear infinite;
        }
        @keyframes plan-check-pop {
          from { transform: scale(.6); opacity: 0 }
          to   { transform: scale(1);  opacity: 1 }
        }
        .plan-check-pop { animation: plan-check-pop .25s ease-out both; }
      `}</style>

      <div
        className="min-h-screen relative text-[#0b1c35]"
        style={{
          background: `
            radial-gradient(900px 500px at 80% -10%, rgba(124,58,237,0.08), transparent 60%),
            radial-gradient(900px 600px at 0%  -10%, rgba(29,122,219,0.10), transparent 55%),
            linear-gradient(180deg, #f8fafc 0%, #f8fafc 70%, #eef2f8 100%)
          `,
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* dot grid */}
        <div
          className="absolute inset-x-0 top-0 h-[520px] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(11,28,53,0.06) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000, transparent 70%)',
          }}
        />

        <header className="relative">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 h-[72px] flex items-center">
            <Image
              src="/images/hader-otoparkcim.png"
              alt="Otoparkçım"
              width={160}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </header>

        {/* HERO */}
        <section className="relative pt-6 lg:pt-10 pb-10">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d7adb]"/>
              <span className="text-[11.5px] font-bold tracking-[0.18em] text-[#33476a]">İŞLETME PAKETLERİ</span>
            </div>
            <h1 className="mt-5 text-[40px] sm:text-[52px] lg:text-[60px] font-extrabold tracking-[-0.025em] leading-[1.02] text-[#0b1c35]">
              Listeleme Paketinizi{' '}
              <span style={{ background: 'linear-gradient(90deg, #1d7adb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                Seçin
              </span>
            </h1>
            <p className="mt-4 text-[16px] sm:text-[17.5px] text-[#33476a] max-w-2xl mx-auto leading-relaxed">
              Otoparkınızı binlerce sürücüye tanıtın. Şeffaf fiyatlandırma, ek ücret yok – istediğiniz an iptal edebilirsiniz.
            </p>

            {/* social proof */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[12.5px] text-[#5a6c8a]">
              <span className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-emerald-500"/> Güvenli ödeme</span>
              <span className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-emerald-500"/> KDV dahil fiyatlar</span>
              <span className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-emerald-500"/> 500+ aktif otopark</span>
            </div>
          </div>
        </section>

        {/* PRICING GRID */}
        <section className="relative">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {PLANS.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selected === plan.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
            <Trust/>
            <FAQ/>
          </div>
        </section>

        <div className="h-32"/>

        {/* STICKY CTA */}
        <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-5">
            <div
              className="pointer-events-auto border border-slate-200/80 rounded-2xl px-4 sm:px-5 py-3 flex items-center gap-3 sm:gap-4"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(18px) saturate(160%)',
                WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                boxShadow: '0 10px 30px rgba(11,28,53,0.10), 0 30px 60px rgba(11,28,53,0.08)',
              }}
            >
              {/* summary */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                              ${selectedPlan ? 'text-white' : 'bg-slate-100 text-[#5a6c8a] border border-dashed border-slate-300'}`}
                  style={selectedPlan ? { background: '#1d7adb', boxShadow: '0 8px 20px rgba(29,122,219,0.30)' } : {}}
                >
                  {selectedPlan
                    ? <CheckIcon className="w-5 h-5"/>
                    : <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2.5"/></svg>
                  }
                </div>
                <div className="min-w-0">
                  {selectedPlan ? (
                    <>
                      <div className="text-[11px] font-bold tracking-[0.16em] text-[#5a6c8a] uppercase">Seçilen plan</div>
                      <div className="text-[14px] font-extrabold text-[#0b1c35] truncate">
                        {selectedPlan.name}{' '}
                        <span className="text-[#5a6c8a] font-semibold">·</span>{' '}
                        <span className="text-[#1769c2]">{selectedPlan.price.toLocaleString('tr-TR')}₺</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[11px] font-bold tracking-[0.16em] text-[#5a6c8a] uppercase">Adım 1 / 2</div>
                      <div className="text-[14px] font-bold text-[#142a4a]">Devam etmek için bir paket seçin</div>
                    </>
                  )}
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                disabled={!selectedPlan || loading}
                onClick={handleContinue}
                className={`h-12 px-5 sm:px-7 rounded-xl font-extrabold text-[14.5px] inline-flex items-center gap-2 transition-all flex-shrink-0
                            ${selectedPlan && !loading
                              ? 'bg-[#0b1c35] text-white hover:bg-[#142a4a]'
                              : 'bg-slate-200 text-[#5a6c8a] cursor-not-allowed'}`}
              >
                {loading ? 'Yükleniyor...' : 'Devam Et'}
                {!loading && <ArrowIcon className="w-4 h-4"/>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
