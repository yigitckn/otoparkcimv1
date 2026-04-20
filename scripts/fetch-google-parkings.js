require('dotenv').config({ path: '.env.local' })
const fs = require('fs')

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

const locations = [
    { name: 'Kadıköy', lat: 40.9927, lng: 29.0277 },
    { name: 'Beşiktaş', lat: 41.0422, lng: 29.0056 },
    { name: 'Şişli', lat: 41.0602, lng: 28.9877 },
    { name: 'Taksim', lat: 41.0370, lng: 28.9850 },
    { name: 'Levent', lat: 41.0819, lng: 29.0111 },
    { name: 'Ataşehir', lat: 40.9923, lng: 29.1244 },
    { name: 'Üsküdar', lat: 41.0234, lng: 29.0156 },
    { name: 'Bakırköy', lat: 40.9819, lng: 28.8772 },
    { name: 'Fatih', lat: 41.0186, lng: 28.9397 },
    { name: 'Maltepe', lat: 40.9358, lng: 29.1308 },
]

async function fetchAll() {
    let all = []

    for (const loc of locations) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc.lat},${loc.lng}&radius=3000&type=parking&key=${API_KEY}`
        const res = await fetch(url)
        const data = await res.json()

        if (data.results) {
            console.log(`${loc.name}: ${data.results.length} otopark`)
            all = all.concat(data.results.map(p => ({...p, district: loc.name })))
        }
    }

    // Tekrar edenleri çıkar
    const unique = []
    const seen = new Set()
    for (const p of all) {
        if (!seen.has(p.place_id)) {
            seen.add(p.place_id)
            unique.push({
                name: p.name,
                address: p.vicinity,
                district: p.district,
                latitude: p.geometry.location.lat,
                longitude: p.geometry.location.lng,
                place_id: p.place_id
            })
        }
    }

    console.log('\n--- TOPLAM ---')
    console.log('Toplam:', unique.length, 'benzersiz otopark')

    // JSON'a kaydet
    fs.writeFileSync('scripts/parkings.json', JSON.stringify(unique, null, 2))
    console.log('parkings.json dosyasına kaydedildi!')
}

fetchAll()