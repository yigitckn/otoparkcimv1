require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function createSlug(name) {
    return name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

async function importParkings() {
    const csv = fs.readFileSync('scripts/parkings_cleaned.csv', 'utf-8')
    const lines = csv.trim().split('\n')

    let added = 0
    let failed = 0

    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',')
        if (parts.length < 5) continue

        const name = parts[0]
        const address = parts[1]
        const district = parts[2]
        const latitude = parseFloat(parts[3])
        const longitude = parseFloat(parts[4])

        const slug = createSlug(name) + '-' + Date.now() + '-' + i

        const { error } = await supabase.from('parkings').insert({
            name,
            slug,
            address,
            district,
            latitude,
            longitude,
            source: 'manual',
            is_active: true,
            is_claimed: false,
            capacity: 0,
            total_capacity: 0,
            current_occupancy: 0,
            hourly_price: 0,
            daily_price: 0,
            monthly_price: 0,
            status: 'available',
            is_verified: false,
            trust_score: 0
        })

        if (error) {
            console.log('Hata:', name, error.message)
            failed++
        } else {
            console.log('Eklendi:', name)
            added++
        }
    }

    console.log('\n--- SONUÇ ---')
    console.log('Eklenen:', added)
    console.log('Başarısız:', failed)
}

importParkings()