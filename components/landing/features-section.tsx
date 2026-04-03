import { MapPin, CreditCard, Clock, Shield, Navigation, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: MapPin,
    title: "Anlık Konum",
    description: "Size en yakın otoparkları haritada görün ve anlık müsaitlik durumunu takip edin.",
    color: "#2f80ed"
  },
  {
    icon: CreditCard,
    title: "Uygun Fiyat",
    description: "Fiyatları karşılaştırın, en ekonomik seçeneği bulun. Şeffaf ücretlendirme.",
    color: "#6fd1eb"
  },
  {
    icon: Clock,
    title: "Hızlı Rezervasyon",
    description: "Saniyeler içinde yerinizi ayırtın. Geldiğinizde yeriniz hazır olsun.",
    color: "#2f80ed"
  },
  {
    icon: Shield,
    title: "Güvenli Ödeme",
    description: "Güvenli ödeme altyapısı ile online ödeme yapın. Fatura ve makbuz anında.",
    color: "#6fd1eb"
  },
  {
    icon: Navigation,
    title: "Navigasyon",
    description: "Seçtiğiniz otoparka tek tıkla navigasyon başlatın. Yol tarifi anında.",
    color: "#2f80ed"
  },
  {
    icon: Star,
    title: "Değerlendirmeler",
    description: "Kullanıcı yorumlarını okuyun, deneyimlerinizi paylaşın. Kaliteli hizmet alın.",
    color: "#6fd1eb"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-[#2f80ed]/10 text-[#2f80ed] text-sm font-medium mb-4">
            Özellikler
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Park Etmek Hiç Bu Kadar{" "}
            <span className="text-[#2f80ed]">Kolay</span> Olmamıştı
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">
            Otoparkçım ile İstanbul&apos;da park yeri bulmak artık stressiz ve hızlı.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-border/50 hover:border-[#2f80ed]/30 hover:shadow-lg hover:shadow-[#2f80ed]/5 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
