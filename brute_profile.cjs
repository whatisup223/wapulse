
const axios = require('axios');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';
const instance = 'رقم ويب هوك ';

async function run() {
    const targetLid = "58089634033684@lid";

    const endpoints = [
        `contact/profile/${encodeURIComponent(instance)}?number=${targetLid}`,
        `contact/profilePicture/${encodeURIComponent(instance)}?number=${targetLid}`,
        `chat/profile/${encodeURIComponent(instance)}?number=${targetLid}`,
        `instance/profile/${encodeURIComponent(instance)}?number=${targetLid}`
    ];

    for (const ep of endpoints) {
        try {
            console.log(`Trying GET ${ep}...`);
            const res = await axios.get(`${url}/${ep}`, { headers: { 'apikey': apiKey } });
            console.log(`✅ Success GET ${ep}:`, JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.log(`❌ Failed GET ${ep}:`, e.response?.status || e.message);
        }
    }
}

run();
