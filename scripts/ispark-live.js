require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function updateStatus() {
    console.log('[' + new Date().toLocaleTimeString() + '] Güncelleniyor...')

    const response = await fetch('https://api.ibb.gov.tr/ispark/Park')
    const data = await response.json()

    let updated = 0

    for (const p of data) {
        const status = p.emptyCapacity > 10 ? 'available' : p.emptyCapacity > 0 ? 'limited' : 'full'

        await fetch(SUPABASE_URL + '/rest/v1/parkings?external_id=eq.' + p.parkID + '&source=eq.ispark', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY
            },
            body: JSON.stringify({ status: status })
        })
        updated++
    }

    console.log('[' + new Date().toLocaleTimeString() + '] ' + updated + ' otopark güncellendi')
}

// Her 5 dakikada bir çalıştır
updateStatus()
setInterval(updateStatus, 5 * 60 * 1000)

console.log('Canlı güncelleme başladı. Kapatmak için CTRL+C')