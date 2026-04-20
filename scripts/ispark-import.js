require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function updateIsparkPrices() {
    console.log('İSPARK fiyatları güncelleniyor...')

    const priceRanges = [
        { min_hour: 0, max_hour: 1, price: 170 },
        { min_hour: 1, max_hour: 2, price: 220 },
        { min_hour: 2, max_hour: 4, price: 300 },
        { min_hour: 4, max_hour: 8, price: 370 },
        { min_hour: 8, max_hour: null, price: 500 }
    ]

    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/parkings?source=eq.ispark`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                hourly_price: 170,
                price_ranges: priceRanges
            })
        }
    )

    if (res.ok) {
        console.log('Tüm İSPARK otoparkları güncellendi!')
    } else {
        const err = await res.text()
        console.error('Hata:', err)
    }
}

updateIsparkPrices()