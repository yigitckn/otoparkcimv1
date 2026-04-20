import Link from "next/link"
import { MapPin, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-100 to-slate-200" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-700 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-200/50">
            <MapPin className="h-4 w-4" />
            <span>  şu an İstanbulda</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 text-balance">
            İstanbulda Park Yeri Bulmanın{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              En Kolay Yolu
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Anlaşmalı otoparkları keşfet, fiyatları karşılaştır, kolayca park et.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-lg shadow-blue-600/30">
              <Link href="/dashboard">
                <MapPin className="mr-2 h-5 w-5" />
                Hemen Park Yeri Bul
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-white/50 px-8 py-6 text-lg backdrop-blur-sm">
              <Link href="/owner/register">
                Otopark Sahipleri İçin
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-800">300+</div>
              <div className="text-sm text-slate-500">Otopark</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-cyan-600" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-800">7/24</div>
              <div className="text-sm text-slate-500">Hizmet</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-800">500+</div>
              <div className="text-sm text-slate-500">Kullanıcı</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}