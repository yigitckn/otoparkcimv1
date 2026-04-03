"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Otoparkçım Logo"
            width={180}
            height={50}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className="text-foreground/80 hover:text-[#2f80ed] transition-colors font-medium"
          >
            Ana Sayfa
          </Link>
          <Link 
            href="/app" 
            className="text-foreground/80 hover:text-[#2f80ed] transition-colors font-medium"
          >
            Otopark Bul
          </Link>
          <Link 
            href="#features" 
            className="text-foreground/80 hover:text-[#2f80ed] transition-colors font-medium"
          >
            Özellikler
          </Link>
          <Link 
            href="#how-it-works" 
            className="text-foreground/80 hover:text-[#2f80ed] transition-colors font-medium"
          >
            Nasıl Çalışır
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild className="text-foreground hover:text-[#2f80ed]">
            <Link href="/auth/login">Giriş Yap</Link>
          </Button>
          <Button 
            asChild 
            className="bg-[#2f80ed] hover:bg-[#2f80ed]/90 text-white"
          >
            <Link href="/auth/register">Kayıt Ol</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link 
              href="/" 
              className="text-foreground/80 hover:text-[#2f80ed] transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link 
              href="/app" 
              className="text-foreground/80 hover:text-[#2f80ed] transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Otopark Bul
            </Link>
            <Link 
              href="#features" 
              className="text-foreground/80 hover:text-[#2f80ed] transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Özellikler
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-foreground/80 hover:text-[#2f80ed] transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Nasıl Çalışır
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/login">Giriş Yap</Link>
              </Button>
              <Button asChild className="w-full bg-[#2f80ed] hover:bg-[#2f80ed]/90 text-white">
                <Link href="/auth/register">Kayıt Ol</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
