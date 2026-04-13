import { Search, MousePointerClick, Car } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Otopark Arayın",
    description: "Konumunuzu girin veya haritada bölgeyi seçin. Yakındaki tüm otoparkları görün."
  },
  {
    number: "02",
    icon: MousePointerClick,
    title: "Rezervasyon Yapın",
    description: "Size uygun otoparkı seçin, fiyatları inceleyin. Tek tıkla yerinizi ayırtin."
  },
  {
    number: "03",
    icon: Car,
    title: "Park Edin",
    description: "Navigasyon ile otoparka gidin. Geldiğinizde yeriniz hazır."
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-semibold mb-4 border border-cyan-500/20">
            Nasıl Çalışır
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Üç Adımda{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Park Yeriniz
            </span>{" "}
            Hazır
          </h2>
          <p className="text-slate-400 text-lg">
            Basit ve hızlı süreç ile dakikalar içinde park yerinizi ayırtin.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
              )}
              
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-2">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-full shadow-lg shadow-cyan-500/30">
                  {step.number}
                </div>
                
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/20">
                  <step.icon className="h-8 w-8 text-cyan-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}