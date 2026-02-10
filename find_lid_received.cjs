
const axios = require('axios');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';
const instance = 'رقم ويب هوك ';

async function run() {
    try {
        const res = await axios.post(`${url}/chat/findMessages/${encodeURIComponent(instance)}`, {
            where: { fromMe: false },
            limit: 10
        }, { headers: { 'apikey': apiKey, 'Content-Type': 'application/json' } });

        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log('❌ Failed:', e.message);
    }
}

run();
