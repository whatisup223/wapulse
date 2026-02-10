
const axios = require('axios');
const fs = require('fs');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';

async function test() {
    const headers = { 'apikey': apiKey };
    const instRes = await axios.get(`${url}/instance/fetchInstances`, { headers });
    const instances = instRes.data;

    for (const inst of instances) {
        const name = inst.instanceName || inst.name;
        if (!name) continue;
        console.log(`Fetching chats for: ${name}`);
        try {
            const res = await axios.post(`${url}/chat/findChats/${encodeURIComponent(name)}`, {}, { headers });
            const records = res.data?.records || res.data;
            fs.writeFileSync(`chats_${name.replace(/\s/g, '_')}.json`, JSON.stringify(records, null, 2));
            console.log(`Saved ${Array.isArray(records) ? records.length : 'error'}`);
        } catch (e) {
            console.log(`Failed for ${name}`);
        }
    }
}

test();
