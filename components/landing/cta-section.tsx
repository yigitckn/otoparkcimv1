import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2f80ed] to-[#6fd1eb] p-8 md:p-16">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Otopark İşletmecisi misiniz?
            </h2>
            <p className="text-white/90 text-lg mb-8 text-pretty">
              Otoparkınızı Otoparkçım&apos;a ekleyin, binlerce potansiyel müşteriye ulaşın. 
              Doluluk oranınızı artırın, işletmenizi büyütün.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                asChild 
                className="w-full sm:w-auto bg-white text-[#2f80ed] hover:bg-white/90 px-8 py-6 text-lg"
              >
                <Link href="/owner/register">
                  <Building2 className="mr-2 h-5 w-5" />
                  Otoparkımı Ekle
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                <Link href="#features">
                  Daha Fazla Bilgi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
