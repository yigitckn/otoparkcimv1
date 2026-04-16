const SUPABASE_URL = 'https://obmfsfwoanrgsuidylae.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibWZzZndvYW5yZ3N1aWR5bGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNTksImV4cCI6MjA5MDcyMjI1OX0.Y1gp7CoGMHQZ3EhubobpzsrYg3yZauGqrO0kqKZYRIs'

async function importIspark() {
    console.log('İSPARK verileri çekiliyor...')

    const response = await fetch('https://api.ibb.gov.tr/ispark/Park')
    const data = await response.json()

    console.log(data.length + ' otopark bulundu')

    const parkings = data.map(p => {
        const name = 'İSPARK ' + (p.parkName || 'Otopark')
        const slug = name
            .toLowerCase()
            .replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ğ/g, 'g')
            .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-' + p.parkID

        return {
            name: name,
            slug: slug,
            address: p.parkName || '',
            district: p.district || 'İstanbul',
            latitude: parseFloat(p.lat) || 0,
            longitude: parseFloat(p.lng) || 0,
            capacity: parseInt(p.capacity) || 0,
            hourly_price: 0,
            status: p.emptyCapacity > 10 ? 'available' : p.emptyCapacity > 0 ? 'limited' : 'full',
            is_active: true,
            is_claimed: false,
            source: 'ispark',
            external_id: String(p.parkID),
            features: p.parkType === 'KAPALI OTOPARK' ? ['covered'] : []
        }
    })

    console.log('Supabase\'e ekleniyor...')

    let success = 0
    let failed = 0

    for (let i = 0; i < parkings.length; i += 50) {
        const batch = parkings.slice(i, i + 50)

        const res = await fetch(SUPABASE_URL + '/rest/v1/parkings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(batch)
        })

        if (res.ok) {
            success += batch.length
            console.log(success + '/' + parkings.length + ' eklendi')
        } else {
            failed += batch.length
            const err = await res.text()
            console.error('Hata:', err)
        }
    }

    console.log('Tamamlandı! Başarılı: ' + success + ', Hatalı: ' + failed)
}

importIspark()