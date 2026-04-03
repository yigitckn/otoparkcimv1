import { Search, MousePointerClick, Car } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Otopark Arayın",
    description: "Konumunuzu girin veya haritada gitmek istediğiniz bölgeyi seçin. Yakındaki tüm otoparkları görün."
  },
  {
    number: "02",
    icon: MousePointerClick,
    title: "Rezervasyon Yapın",
    description: "Size uygun otoparkı seçin, fiyat ve özellikleri inceleyin. Tek tıkla yerinizi ayırtın."
  },
  {
    number: "03",
    icon: Car,
    title: "Park Edin",
    description: "Navigasyon ile otoparka gidin. Geldiğinizde yeriniz hazır. Park edin ve işinize bakın."
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-[#2f80ed]/5 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-[#6fd1eb]/20 text-[#2f80ed] text-sm font-medium mb-4">
            Nasıl Çalışır
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Üç Adımda{" "}
            <span className="bg-gradient-to-r from-[#2f80ed] to-[#6fd1eb] bg-clip-text text-transparent">
              Park Yeriniz
            </span>{" "}
            Hazır
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">
            Basit ve hızlı süreç ile dakikalar içinde park yerinizi ayırtın.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#2f80ed] to-[#6fd1eb]" />
              )}
              
              <div className="relative bg-white rounded-2xl p-8 shadow-lg shadow-[#2f80ed]/5 border border-border/50 text-center">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#2f80ed] to-[#6fd1eb] text-white text-sm font-bold rounded-full">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#6fd1eb]/20 to-[#2f80ed]/20 flex items-center justify-center mb-6 mt-2">
                  <step.icon className="h-8 w-8 text-[#2f80ed]" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
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
