
const axios = require('axios');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';
const instance = 'رقم ويب هوك ';

async function run() {
    try {
        console.log(`Trying GET group/fetchAllGroups/${encodeURIComponent(instance)}...`);
        const res = await axios.get(`${url}/group/fetchAllGroups/${encodeURIComponent(instance)}`, {
            headers: { 'apikey': apiKey }
        });

        console.log('✅ Groups found:', res.data?.length);
        console.log(JSON.stringify(res.data?.slice(0, 2), null, 2));
    } catch (e) {
        console.log('❌ Failed:', e.message);
    }
}

run();
