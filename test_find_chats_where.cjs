
const axios = require('axios');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';
const instance = 'رقم ويب هوك ';

async function run() {
    const targetLid = "58089634033684@lid";

    try {
        console.log(`Trying POST chat/findChats with where clause for ${targetLid}...`);
        const res = await axios.post(`${url}/chat/findChats/${encodeURIComponent(instance)}`, {
            where: { remoteJid: targetLid }
        }, { headers: { 'apikey': apiKey, 'Content-Type': 'application/json' } });

        console.log('✅ RAW DATA:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log('❌ Failed:', e.message);
    }
}

run();
