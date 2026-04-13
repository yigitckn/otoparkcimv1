import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="pt-0 pb-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8 md:p-16 border border-slate-700/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-semibold mb-6 border border-cyan-500/20">
              İşletmeciler çin
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Otopark İşletmecisi misiniz?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Otoparkınızı Otoparkcım'a ekleyin, binlerce potansiyel müşteriye ulaşın. 
              Doluluk oranınızı artırın, işletmenizi büyütün.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                asChild 
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg shadow-lg shadow-cyan-500/25"
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
                className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 text-lg"
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