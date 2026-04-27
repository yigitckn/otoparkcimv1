'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('contact_messages')
      .insert([formData])

    setLoading(false)

    if (error) {
      console.error('Hata:', error)
      alert('Bir hata oluştu, lütfen tekrar dene.')
    } else {
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      setTimeout(() => setSubmitted(false), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bize Ulaşın</h1>
          <p className="text-lg text-gray-600">
            Sorularınız, önerileriniz veya geri bildirimleriniz için buradayız!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Email */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">E-posta</h3>
            <p className="text-gray-600 text-sm mb-3">Bize e-posta gönderin</p>
            <a href="mailto:destek@otoparkcim.com" className="text-blue-600 hover:text-blue-700 font-medium">
              destek@otoparkcim.com
            </a>
          </div>

          {/* Phone */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Telefon</h3>
            <p className="text-gray-600 text-sm mb-3">Hafta içi 09:00 - 18:00</p>
            <a href="tel:+902121234567" className="text-green-600 hover:text-green-700 font-medium">
              +90 (212) 123 45 67
            </a>
          </div>

          {/* Address */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Adres</h3>
            <p className="text-gray-600 text-sm mb-3">Ofisimizi ziyaret edin</p>
            <p className="text-gray-700">
              Levent, İstanbul
              <br />
              Türkiye
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mesaj Gönderin</h2>
          
          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✓ Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adınız Soyadınız
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ahmet Yılmaz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresiniz
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ahmet@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konu
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Bir konu seçin</option>
                <option value="support">Teknik Destek</option>
                <option value="partnership">Otopark İşbirliği</option>
                <option value="feedback">Geri Bildirim</option>
                <option value="complaint">Şikayet</option>
                <option value="checkin">Check-in Sorunu</option>
                <option value="points">Puan Sistemi</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesajınız
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Mesajınızı buraya yazın..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Gönderiliyor...' : 'Mesajı Gönder'}
            </button>
          </form>
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Hızlı cevaplar mı arıyorsunuz?</p>
          <Link 
            href="/help" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Yardım Merkezini Ziyaret Edin
          </Link>
        </div>
      </main>
    </div>
  )
}