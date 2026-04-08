import { MapPin, CreditCard, Clock, Navigation } from "lucide-react"

const features = [
  {
    icon: MapPin,
    title: "Anlık Konum",
    description: "En yakın otoparkları haritada gör, müsaitlik durumunu anında takip et.",
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    icon: CreditCard,
    title: "Uygun Fiyat",
    description: "Fiyatlari karşılaştır, en ekonomik seçeneği bul.",
    gradient: "from-cyan-400 to-teal-400"
  },
  {
    icon: Clock,
    title: "Hızlı Rezervasyon",
    description: "Saniyeler içinde yerini ayırt, geldiğinde hazır olsun.",
    gradient: "from-blue-600 to-blue-400"
  },
  {
    icon: Navigation,
    title: "Navigasyon",
    description: "Tek tıkla yol tarifi al, otoparka kolayca ulaş.",
    gradient: "from-teal-400 to-cyan-400"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-slate-200 via-slate-600 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-cyan-300 text-sm font-semibold mb-4 backdrop-blur-sm">
            Özellikler
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Neden <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Otoparkçım</span>?
          </h2>
          <p className="text-blue-100/80 text-lg">
            Park etmek hiç bu kadar kolay olmamıştı.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 border border-white/10 hover:border-white/20"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              
              <p className="text-blue-100/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}