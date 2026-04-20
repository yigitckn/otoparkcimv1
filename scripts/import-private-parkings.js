require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const parkings = require('./parkings.json')

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
    const privateParkings = parkings.filter(p =>
        !p.name.toLowerCase().includes('ispark') &&
        !p.name.toLowerCase().includes('İspark')
    )

    console.log('Eklenecek:', privateParkings.length, 'otopark')

    let added = 0
    let skipped = 0

    for (const p of privateParkings) {
        const { data: existing } = await supabase
            .from('parkings')
            .select('id')
            .eq('latitude', p.latitude)
            .eq('longitude', p.longitude)
            .single()

        if (existing) {
            skipped++
            continue
        }

        const slug = createSlug(p.name) + '-' + Date.now()

        const { error } = await supabase.from('parkings').insert({
            name: p.name,
            slug: slug,
            address: p.address || '',
            district: p.district,
            latitude: p.latitude,
            longitude: p.longitude,
            source: 'google',
            external_id: p.place_id,
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
            console.log('Hata:', p.name, error.message)
        } else {
            added++
        }
    }

    console.log('\n--- SONUÇ ---')
    console.log('Eklenen:', added)
    console.log('Atlanan (zaten var):', skipped)
}

importParkings()