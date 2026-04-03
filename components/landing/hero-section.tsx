import Link from "next/link"
import { MapPin, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6fd1eb]/20 via-white to-[#2f80ed]/10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#6fd1eb]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#2f80ed]/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2f80ed]/10 text-[#2f80ed] text-sm font-medium mb-6">
            <MapPin className="h-4 w-4" />
            <span>İstanbul&apos;un En Kapsamlı Otopark Uygulaması</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Park Yerinizi{" "}
            <span className="bg-gradient-to-r from-[#2f80ed] to-[#6fd1eb] bg-clip-text text-transparent">
              Saniyeler İçinde
            </span>{" "}
            Bulun
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            İstanbul&apos;daki yüzlerce otopark arasından size en yakın, en uygun fiyatlı ve 
            müsait olanı anında keşfedin. Rezervasyon yapın, park edin.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              asChild 
              className="w-full sm:w-auto bg-[#2f80ed] hover:bg-[#2f80ed]/90 text-white px-8 py-6 text-lg"
            >
              <Link href="/app">
                <MapPin className="mr-2 h-5 w-5" />
                Otopark Bul
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="w-full sm:w-auto border-[#2f80ed] text-[#2f80ed] hover:bg-[#2f80ed]/5 px-8 py-6 text-lg"
            >
              <Link href="/owner/register">
                Otoparkınızı Ekleyin
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-5 w-5 text-[#2f80ed]" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Otopark</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-[#6fd1eb]" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">7/24</div>
              <div className="text-sm text-muted-foreground">Hizmet</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-[#2f80ed]" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground">Kullanıcı</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
