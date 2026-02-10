
const axios = require('axios');
const fs = require('fs');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';
const instance = 'رقم ويب هوك ';

async function run() {
    try {
        const res = await axios.post(`${url}/chat/findContacts/${encodeURIComponent(instance)}`, {}, { headers: { 'apikey': apiKey } });
        fs.writeFileSync('contacts_dump.json', JSON.stringify(res.data, null, 2));
        console.log('Dumped contacts');
    } catch (e) {
        console.log('Failed:', e.message);
    }
}

run();
