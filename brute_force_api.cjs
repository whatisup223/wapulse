
const axios = require('axios');
const fs = require('fs');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';
const instance = 'user_123456';

async function test() {
    const headers = { 'apikey': apiKey };
    const endpoints = [
        'contact/findAll',
        'contact/fetchContacts',
        'contact/sync',
        'chat/findAll',
        'group/findAll'
    ];

    for (const ep of endpoints) {
        try {
            console.log(`Testing GET ${url}/${ep}/${instance}`);
            const res = await axios.get(`${url}/${ep}/${instance}`, { headers });
            console.log(`✅ SUCCESS GET ${ep}`);
            fs.writeFileSync(`success_${ep.replace(/\//g, '_')}.json`, JSON.stringify(res.data, null, 2));
        } catch (e) {
            try {
                console.log(`Testing POST ${url}/${ep}/${instance}`);
                const res = await axios.post(`${url}/${ep}/${instance}`, {}, { headers });
                console.log(`✅ SUCCESS POST ${ep}`);
                fs.writeFileSync(`success_post_${ep.replace(/\//g, '_')}.json`, JSON.stringify(res.data, null, 2));
            } catch (e2) {
                // console.log(`❌ FAILED ${ep}`);
            }
        }
    }
}

test();
